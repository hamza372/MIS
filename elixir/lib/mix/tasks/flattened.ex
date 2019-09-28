defmodule Mix.Tasks.Flattened do
	use Mix.Task

	def run (["migrate", "lazy"]) do
		Application.ensure_all_started(:sarkar)

		{:ok, res} = Postgrex.query(Sarkar.School.DB, "SELECT school_id from backup", [])

		schools = res.rows 
			|> Enum.map(fn [sid] -> sid end)
			|> Enum.each(fn sid -> 
				migrate_to_flattened_lazy(sid)
			end)
	end

	def run(["migrate"]) do
		# query each db out of backup
		# flatten.... all the way out...

		Application.ensure_all_started(:sarkar)

		{:ok, res} = Postgrex.query(Sarkar.School.DB, "SELECT school_id from backup", [])

		schools = res.rows 
			|> Enum.map(fn [sid] -> sid end)
			|> Enum.each(fn sid -> 
				migrate_to_flattened_db(sid)
			end)

	end

	def migrate_to_flattened_db(school_id) do
		{:ok, res} = Postgrex.query(
			Sarkar.School.DB, 
			"SELECT path, value, time, type, client_id from writes where school_id=$1 order by time asc", 
			[school_id])

		writes = res.rows
		|> Enum.reduce(%{}, fn [path, value, time, type, client_id], collect -> 
			pkey = Enum.join(path, ",")
			Map.put(collect, pkey, %{
				"date" => time,
				"value" => value,
				"path" => path,
				"type" => type,
				"client_id" => client_id
			})
		end)

		Sarkar.Store.School.save_flattened(school_id, writes)

	end


	def doesnt_work(school_id) do

		{:ok, res} = Postgrex.query(Sarkar.School.DB, "SELECT path, value, time, type, client_id from writes where school_id=$1 order by time asc", [school_id])

		{args, query_string, _} = res.rows
			|> Enum.reduce(%{}, fn [path, value, time], collect -> 

				if is_map(value) do
					Dynamic.flatten(value)
					|> Enum.reduce(collect, fn {p, v}, runner -> 
						p = path ++ p

						Map.put(runner, Enum.join(p, ","), [p, v, time])
					end)
				else
					Map.put(collect, Enum.join(path, ","), [path, value, time])
				end

			end)
			|> Map.values()
			|> Enum.reduce({[], [], 0}, fn [path, value, time], {combined_args, combined_string, index} -> 
				{
					[Enum.join(Enum.drop(path, 1), ","), value, time] ++ combined_args,
					["($1, $#{index * 3 + 2}, $#{index * 3 + 3}, $#{index * 3 + 4}) " | combined_string],
					index + 1
				}
			end)

		query = "INSERT INTO flattened_schools (school_id, path, value, time) VALUES #{Enum.join(query_string, ",")}"
		arguments = [school_id | args]
		IO.inspect query

		IO.inspect Postgrex.query(Sarkar.School.DB, query, arguments)

	end

	def migrate_to_flattened_lazy(school_id) do
		
		{:ok, res} = Postgrex.query(Sarkar.School.DB, "SELECT db FROM backup where school_id=$1", [school_id])

		[[ db ]] = res.rows

		Postgrex.transaction(Sarkar.School.DB, fn conn -> 
			flattened = Dynamic.flatten(db)
				|> Enum.map(fn {p, v} -> 
					case Postgrex.query(conn, "INSERT INTO flattened_schools (school_id, path, value, time) 
						VALUES ($1, $2, $3, $4)
						ON CONFLICT (school_id, path) DO NOTHING", [school_id, Enum.join(p, ","), v, :os.system_time(:millisecond)]) do
							{:ok, res} -> ""
							{:error, err} -> 
								IO.puts "ERROR"
								IO.inspect err
						end
			end)
		end, timeout: :infinity)



	end

end