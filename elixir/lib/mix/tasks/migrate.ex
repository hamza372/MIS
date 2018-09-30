defmodule Mix.Tasks.Migrate do
	use Mix.Task

	def run(_) do
		Application.ensure_all_started(:sarkar)
		case Postgrex.query(Sarkar.School.DB, "SELECT school_id, db from backup", []) do
			{:ok, res} -> 
				IO.puts "got result #{res.num_rows}"
				res.rows
				|> Enum.each(fn([school_id, school_db]) -> 
					# return a new school db to insert.
					next_students = Enum.map(Map.get(school_db, "students", %{}), fn({id, student}) -> 
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
					end) |> Enum.into(%{})
					
					next_school = Map.put(school_db, "students", next_students )
					# now save 
					case Postgrex.query(Sarkar.School.DB, "INSERT INTO backup(school_id, db) VALUES ($1, $2) ON CONFLICT(school_id) DO UPDATE SET db=$2", [school_id, next_school]) do
						{:ok, _} -> IO.puts "updated school #{school_id}"
						{:error, err} -> IO.inspect err
					end
				end)

				# IO.inspect get_in(next_backup, ["five", "students"])

			{:err, msg} -> 
				IO.puts "ERROR"
				IO.inspect msg
		end
	end
end