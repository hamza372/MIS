defmodule Sarkar.Store.School do
	# this module exists to provide sync/restore capabilities for clients

	def save(school_id, writes) do
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

			# TODO: THIS DOES NOT HANDLE DELETES
		flattened_db = Map.values(writes)
			|> Enum.reduce([], fn(%{"date" => date, "value" => value, "path" => path, "type" => type, "client_id" => client_id}, agg) -> 
					
				flat_write = Dynamic.flatten(value)
					|> Enum.map(fn {p, v} -> [school_id, Enum.join(path ++ p, ","), v, date] end)

				Enum.concat(agg, flat_write)
			end)
			|> Enum.reduce([], fn curr, agg -> Enum.concat(agg, curr) end)

		gen_value_strings_db = 1..trunc(Enum.count(flattened_db)/4)
			|> Enum.map(fn i -> 
				x = (i - 1) * 4 + 1
				"($#{x}, $#{x + 1}, $#{x + 2}, $#{x + 3})" 
			end)


		{:ok} = case Postgrex.query(
			Sarkar.School.DB,
			"INSERT INTO flattened_schools (school_id, path, value, time) 
			VALUES #{Enum.join(gen_value_strings_db, ",")} 
			ON CONFLICT (school_id, path) DO UPDATE set value = excluded.value, time = excluded.time",
			flattened_db) do
				{:ok, resp} -> {:ok}
				{:error, err} -> 
					IO.puts "db save failed"
					IO.inspect err
					{:err}
		end

		case Postgrex.query(
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

	def load(school_id) do
		case Postgrex.query(
			Sarkar.School.DB,
			"SELECT path, value FROM flattened_schools WHERE school_id=$1 ORDER BY time asc", [school_id]) do
				{:ok, %Postgrex.Result{num_rows: 0}} -> {%{}, %{}}
				{:ok, resp} ->
					inflated = resp.rows
					|> Enum.reduce(%{}, fn([p, v], agg) -> 
						path = String.split(p, ",")
						Dynamic.put(agg, path, v)
					end)

					case Postgrex.query(Sarkar.School.DB, "SELECT path, value, time, type, client_id FROM writes WHERE school_id=$1 ORDER BY time desc limit $2", [school_id, 50]) do
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
		case Postgrex.query(
			Sarkar.School.DB,
			"SELECT school_id from flattened_schools", []) do
				{:ok, resp} -> 
					schools = Enum.map(resp.rows, fn([ school ]) -> school end)
					{:ok, schools}
				{:error, err} -> {:error, err}
		end
	end

	def get_writes(school_id, last_sync_date) do
		case Postgrex.query(
			Sarkar.School.DB,
			"SELECT path, value, time, type, client_id FROM writes where school_id=$1 AND time > $2 ORDER BY time desc", 
			[school_id, last_sync_date]) do
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