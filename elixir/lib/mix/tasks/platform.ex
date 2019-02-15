defmodule Mix.Tasks.Platform do
	use Mix.Task

	def run(["ingest_data"]) do
		Application.ensure_all_started(:sarkar)

		{:ok, body} = case File.exists?(Application.app_dir(:sarkar, "priv/sample.json")) do
			true -> File.read(Application.app_dir(:sarkar, "priv/sample.json"))
			false -> File.read("priv/sample.json")
		end
		{:ok, json} = Poison.decode(body)

		Enum.each(json, fn school_profile -> 
			id = Map.get(school_profile, "refcode")

			case Postgrex.query(Sarkar.School.DB, "INSERT INTO platform_schools(id, db) VALUES ($1, $2)", [id, school_profile]) do
				{:ok, _} -> IO.puts "updated #{id}"
				{:error, err} -> 
					IO.puts "error on school #{id}"
					IO.inspect err
			end
		end)
	end

	def run(args) do
		Application.ensure_all_started(:sarkar)
		case Postgrex.query(Sarkar.School.DB, "SELECT id, sync_state from suppliers", []) do
			{:ok, res} ->
				res.rows
				|> Enum.each(fn ([id, sync_state]) ->

					{:ok, next_sync_state} = case args do
						["fees"] -> {:ok, adjust_fees(id, sync_state)}
						["add_matches"] -> {:ok, add_matches(id, sync_state)}
						["gen_matches"] -> {:ok, gen_matches(id, sync_state)}
						other -> 
							IO.inspect other
							IO.puts "ERROR: supply a recognized task to run"
							{:error, "no task"}
					end

					case Postgrex.query(Sarkar.School.DB, "INSERT INTO suppliers(id, sync_state) VALUES ($1, $2) ON CONFLICT(id) DO UPDATE SET sync_state=$2", [id, next_sync_state]) do
						{:ok, _} -> IO.puts "updated school #{id}"
						{:error, err} -> 
							IO.puts "error on school: #{id}"
							IO.inspect err
					end

					Sarkar.Supplier.reload(id)
				end)

			{:err, msg} -> 
				IO.puts "ERROR"
				IO.inspect msg
		end
	end

	defp gen_matches(id, sync_state) do
		matches = Map.get(sync_state, "matches", %{})

		# put the first 100 things into here
		{:ok, resp} = Postgrex.query(Sarkar.School.DB, "SELECT id, db from platform_schools limit 10", [])

		next_matches = resp.rows
		|> Enum.reduce(%{}, fn([school_id, db], agg) -> 
			Map.put(agg, school_id, %{
				"status" => "NEW"
			})
		end)

		Map.put(sync_state, "matches", next_matches)
	end

	defp add_matches(id, sync_state) do
		# this needs to read from csv file and load into the school ids
		sync_state
	end

	defp adjust_fees(_school_id, school_db) do
		# has to return the new school_db
			next_students = Map.get(school_db, "students", %{})
				|> Enum.map(
					fn({id, student}) -> 
						current_fee = Map.get(student, "Fee")
						fees = %{
							UUID.uuid4() => %{
								"name" => "Monthly Fee",
								"amount" => current_fee,
								"type" => "FEE",
								"period" => "MONTHLY"
							}
						}
						{id, Map.put(student, "fees", fees)}
					end)
				|> Enum.into(%{})
			
			Map.put(school_db, "students", next_students)
	end
end