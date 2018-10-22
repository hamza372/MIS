defmodule Mix.Tasks.Migrate do
	use Mix.Task

	def run(_) do
		Application.ensure_all_started(:sarkar)
		case Postgrex.query(Sarkar.School.DB, "SELECT school_id, db from backup", []) do
			{:ok, res} ->

				next_backup = res.rows
				|> Enum.each(fn ([school_id, school_db]) ->
					# next_school = adjust_fees(school_id, school_db)
					# next_school = add_payment_name(school_id, school_db)
					next_school = adjust_users_table(school_id, school_db)

					case Postgrex.query(Sarkar.School.DB, "INSERT INTO backup(school_id, db) VALUES ($1, $2) ON CONFLICT(school_id) DO UPDATE SET db=$2", [school_id, next_school]) do
						{:ok, _} -> IO.puts "updated school #{school_id}"
						{:error, err} -> IO.inspect err
					end
				end)


			{:err, msg} -> 
				IO.puts "ERROR"
				IO.inspect msg
		end
	end

	defp add_payment_name(school_id, school_db) do

		next_students = Map.get(school_db, "students", %{})
		|> Enum.map(
			fn({id, student}) ->
				current_payments = Map.get(student, "payments", %{})
				current_fees = Map.get(student, "fees", %{})

				next_payments = Enum.map(current_payments, fn({id, payment}) -> 
					case payment do
						%{"fee_id" => fee_id} -> 
							fee = Map.get(current_fees, fee_id, %{})
							fee_name = Map.get(fee, "name", "Fee")
							{id, Map.put(payment, "fee_name", fee_name)}
						other -> 
							{id, payment}
					end
				end)
				|> Enum.into(%{})

				{id, Map.put(student, "payments", next_payments)}
			end)
		|> Enum.into(%{})
		
		IO.inspect next_students
		Map.put(school_db, "students", next_students)
	end

	defp adjust_fees(school_id, school_db) do
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

	defp adjust_users_table(school_id, school_db) do
		
		next_users = Map.get(school_db, "users", %{})
			|> Enum.map(
				fn({id, user}) -> 
					# lookup against faculty
					IO.inspect(user)
					{uid, faculty}= Enum.find(Map.get(school_db, "faculty"), fn ({id, f}) -> 
						Map.get(f, "Username") == Map.get(user, "username")
					end) 
					IO.inspect faculty
					name = Map.get(faculty, "Name")

					{id, Map.put(user, "name", name)}
				end)
			|> Enum.into(%{})
		
		Map.put(school_db, "users", next_users)
	end
end