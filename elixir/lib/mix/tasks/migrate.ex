defmodule Mix.Tasks.Migrate do
	use Mix.Task

	def run(args) do
		Application.ensure_all_started(:sarkar)
		case Postgrex.query(Sarkar.School.DB, "SELECT school_id, db from backup", []) do
			{:ok, res} ->

				next_backup = res.rows
				|> Enum.each(fn ([school_id, school_db]) ->

					{:ok, next_school} = case args do
						["fees"] -> {:ok, adjust_fees(school_id, school_db)}
						["payment"] -> {:ok, add_payment_name(school_id, school_db)}
						["users"] -> {:ok, adjust_users_table(school_id, school_db)}
						["fix-fees"] -> {:ok, remove_november_payments(school_id, school_db)}
						["duplicate-fees"] -> {:ok, remove_duplicate_payments(school_id, school_db)}
						["class-history"] -> {:ok, add_class_history(school_id, school_db)}
						["delete-all-fees-wisdom-sadia"] -> {:ok, delete_wisdom_sadia_fees(school_id, school_db)}
						other -> 
							IO.inspect other
							IO.puts "ERROR: supply a recognized task to run"
							{:error, "no task"}
					end

					case Postgrex.query(Sarkar.School.DB, "INSERT INTO backup(school_id, db) VALUES ($1, $2) ON CONFLICT(school_id) DO UPDATE SET db=$2", [school_id, next_school]) do
						{:ok, _} -> IO.puts "updated school #{school_id}"
						{:error, err} -> 
							IO.puts "error on school: #{school_id}"
							IO.inspect err
					end
				end)

			{:err, msg} -> 
				IO.puts "ERROR"
				IO.inspect msg
		end
	end

	defp delete_wisdom_sadia_fees(school_id, school_db) do

		case school_id do
			id when  id == "sadiaschool" or id == "wisdomschool" -> 
				IO.puts "=========editing #{id}============"
				next_students = Map.get(school_db, "students", %{})
					|> Enum.map( fn({id, student}) -> 
						Map.put(student, "fees", %{})
						|> Map.put("payments", %{})
					end)

				Map.put(school_db, "students", next_students)
			_ -> school_db
		end
	end

	defp add_class_history(school_id, school_db) do

		section_metadata = Map.get(school_db, "classes", %{})
			|> Enum.map(fn({ _, c }) ->
				Enum.map(Map.get(c, "sections", %{}), fn({ section_id, section }) -> 

					{section_id, %{
						class_id: Map.get(c, "id", ""),
						class_name: Map.get(c, "name", ""),
						section_name: Map.get(section, "name", "")
					}}

				end)
			end)
			|> Enum.reduce([], fn x, acc -> acc ++ x end)
			|> Enum.into(%{})

		next_students = Map.get(school_db, "students", %{})
		|> Enum.map(
			fn({id, student}) ->
				section_id = Map.get(student, "section_id", "")
				meta = Map.get(section_metadata, section_id, %{})

				updated = case section_id do
					"" -> Dynamic.put(student, ["class_history"], %{})
					_ -> Dynamic.put(student, ["class_history", section_id], %{
							"class_id" => Map.get(meta, :class_id, ""),
							"class_name" => Map.get(meta, :class_name, ""),
							"section_name" => Map.get(meta, :section_name, ""),
							"start_date" => 1543604400000
						})
				end

				{id, updated}
			end
		)
		|> Enum.into(%{})

		Map.put(school_db, "students", next_students)
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

	defp remove_november_payments(school_id, school_db) do
		next_students = Map.get(school_db, "students", %{})
			|> Enum.map(
				fn({id, student}) ->
					
					payments = Map.get(student, "payments", %{})

					nextPayments = payments
					|> Enum.reduce(%{}, fn({id, payment}, agg) -> 
						d = Map.get(payment, "date")
						if d < 1541012400000 do
							Map.put(agg, id, payment)
						else
							agg
						end
					end)

					IO.inspect nextPayments

					{id, Map.put(student, "payments", nextPayments)}
				end)
			|> Enum.into(%{})
			
		Map.put(school_db, "students", next_students)
			
	end

	defp remove_duplicate_payments(school_id, school_db) do
		next_students = Map.get(school_db, "students", %{})
			|> Enum.map(
				fn({id, student}) ->
					
					payments = Map.get(student, "payments", %{})

					# if anything has same date and fee_id, remove one of them and is type owed
					{nextPayments, existing} = payments
					|> Enum.reduce({%{}, %{}}, fn({id, payment}, {agg, existing}) -> 
						d = Map.get(payment, "date")
						fid = Map.get(payment, "fee_id")
						type = Map.get(payment, "type")
						nkey = "#{d}-#{fid}"

						IO.inspect existing
						if type == "OWED" and Map.has_key?(existing, nkey) do
							IO.puts "duplicate payment!!"
							IO.inspect Map.get(existing, nkey)
							IO.inspect payment
							{agg, existing}
						else
							{Map.put(agg, id, payment), Map.put(existing, nkey, true)}
						end

					end)

					# IO.inspect nextPayments

					{id, Map.put(student, "payments", nextPayments)}
				end)
			|> Enum.into(%{})
		Map.put(school_db, "students", next_students)

	end
end