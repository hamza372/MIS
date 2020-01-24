defmodule Sarkar.Store.School do
	# this module exists to provide sync/restore capabilities for clients

	def save(school_id, writes) do

		save_flattened(school_id, writes)
		save_writes(school_id, writes)

	end

	def save_writes(school_id, writes) do
		flattened_writes = Map.values(writes)
			|> Enum.map(fn %{"date" => date, "value" => value, "path" => path, "type" => type, "client_id" => client_id} -> 
				[school_id, path, value, date, type, client_id] 
			end)
			|> Enum.reduce([], fn curr, agg -> Enum.concat(agg, curr) end)

		gen_value_strings_writes = Stream.with_index(Map.values(writes), 1)
			|> Enum.map(fn {w, i} -> 
				x = (i - 1) * 6 + 1
				"($#{x}, $#{x + 1}, $#{x + 2}, $#{x + 3}, $#{x + 4}, $#{x + 5})" 
			end)

		case Sarkar.DB.Postgres.query(
			Sarkar.School.DB,
			"INSERT INTO writes (school_id, path, value, time, type, client_id) VALUES #{Enum.join(gen_value_strings_writes, ",")}", 
			flattened_writes) do
				{:ok, resp} -> {:ok}
				{:error, err} -> 
					IO.puts "write failed"
					IO.inspect err
					{:ok}
		end

	end

	def save_flattened(school_id, writes) do
		flattened_db = Map.values(writes)
			|> Enum.reduce([], fn(%{"date" => date, "value" => value, "path" => path, "type" => type, "client_id" => client_id}, agg) -> 
					
				path = Enum.drop(path, 1)
				if is_map(value) do
					flat_write = Dynamic.flatten(value)
						|> Enum.map(fn {p, v} -> {Enum.join(path ++ p, ","), [type, school_id, path ++ p, v, date]} end)
					
					Enum.concat(agg, flat_write)
				else 
					[{Enum.join(path, ","), [type, school_id, path, value, date]} | agg]
					# Enum.concat( agg, [[type, school_id, path, value, date]] )
				end
			end)
			|> Enum.sort( fn({_, [_, _, _, _, d1]}, {_, [_, _, _, v, d2]} ) -> d1 < d2 end)
			|> Enum.into(%{})
			|> Enum.map(fn {_, v} -> v end)

		# array of map %{ type: "MERGE" | "DELETE", mutations: [ [date, value, path, type, client_id] ] }
		flattened_db_sequence = flattened_db
			|> Enum.reduce([], fn([type, school_id, path, value, date], agg) ->
				prev = Enum.at(agg, -1) || %{}

				case Map.get(prev, "type") do
					^type -> 
						Enum.drop(agg, -1) ++ [%{
							"type" => type,
							"mutations" => Map.get(prev, "mutations") ++ [[school_id, Enum.join(path, ","), value, date]]
						}]
					other -> 
						agg  ++ [%{
							"type" => type,
							"mutations" => [
								[school_id, Enum.join(path, ","), value, date]
							]
						}]
				end
			end)

		# now just generate the sql queries for each one of these segments

		chunk_size = 100

		results = Postgrex.transaction(Sarkar.School.DB, fn(conn) -> 

			flattened_db_sequence
			|> Enum.map(fn %{"type" => type, "mutations" => muts} -> 

				muts
				|> Enum.chunk_every(chunk_size)
				|> Enum.map(fn chunked_muts ->

					case type do
						"MERGE" -> 
							gen_value_strings_db = 1..trunc(Enum.count(chunked_muts))
								|> Enum.map(fn i ->
									x = (i - 1) * 4 + 1
									"($#{x}, $#{x + 1}, $#{x + 2}, $#{x + 3})" 
								end)

							query_string = "INSERT INTO flattened_schools (school_id, path, value, time)
								VALUES #{Enum.join(gen_value_strings_db, ",")}
								ON CONFLICT (school_id, path) DO UPDATE set value=excluded.value, time=excluded.time"

							arguments = chunked_muts |> Enum.reduce([], fn (a, collect) -> collect ++ a end)
							{:ok, res }= Sarkar.DB.Postgres.query(conn, query_string, arguments)
							res

						"DELETE" -> 
							{query_section, arguments} = chunked_muts 
								|> Enum.with_index()
								|> Enum.map(fn {[_, path, _, _], index} -> 
									{ "(path LIKE $#{index + 2})", [path <> "%"] }
								end)
								|> Enum.reduce({[], []}, fn {query, arg}, {queries, args} -> {
									[ query | queries ],
									args ++ arg
								} end)
							
							query_string = "DELETE FROM flattened_schools WHERE school_id = $1 and #{Enum.join(query_section, " OR ")}"
							{:ok, res} = Sarkar.DB.Postgres.query(conn, query_string, [school_id | arguments])
							res
					end
				end)
			end)
		end, pool: DBConnection.Poolboy)

	end

	def load(school_id) do
		case Sarkar.DB.Postgres.query(
			Sarkar.School.DB,
			"SELECT path, value FROM flattened_schools WHERE school_id=$1 ORDER BY time asc", [school_id]) do
				{:ok, %Postgrex.Result{num_rows: 0}} -> {%{}, %{}}
				{:ok, resp} ->
					inflated = resp.rows
					|> Enum.reduce(%{}, fn([p, v], agg) -> 
						path = String.split(p, ",")
						Dynamic.put(agg, path, v)
					end)

					case Sarkar.DB.Postgres.query(Sarkar.School.DB, "SELECT path, value, time, type, client_id FROM writes WHERE school_id=$1 ORDER BY time desc limit $2", [school_id, 50]) do
						{:ok, writes_resp} ->
							write_formatted = writes_resp.rows
								|> Enum.map(fn([ [_ | p] = path, value, time, type, client_id]) -> {Enum.join(p, ","), %{
									"path" => path, "value" => value, "date" => time, "type" => type, "client_id" => client_id
								}} end)
								|> Enum.reverse
								|> Enum.into(%{})

							{inflated, write_formatted}
						{:error, err} -> {:error, err} 
					end
				{:error, err} ->
					IO.inspect err
					{:error, err}
		end
	end

	def get_school_ids() do
		case Sarkar.DB.Postgres.query(
			Sarkar.School.DB,
			"SELECT school_id from flattened_schools", []) do
				{:ok, resp} -> 
					schools = Enum.map(resp.rows, fn([ school ]) -> school end)
					{:ok, schools}
				{:error, err} -> {:error, err}
		end
	end

	def get_writes(school_id, last_sync_date) do
		case Sarkar.DB.Postgres.query(
			Sarkar.School.DB,
			"SELECT path, value, time, type, client_id FROM writes where school_id=$1 AND time > $2 ORDER BY time desc", 
			[school_id, last_sync_date], timeout: 30000) do
				{:ok, writes_resp} ->
					write_formatted = writes_resp.rows
						|> Enum.map(fn([ [_ | p] = path, value, time, type, client_id]) -> {Enum.join(p, ","), %{
							"path" => path, "value" => value, "date" => time, "type" => type, "client_id" => client_id
						}} end)
						|> Enum.reverse
						|> Enum.into(%{})
					
					{:ok, write_formatted}

				{:error, err} -> {:error, err}
		end
	end
end