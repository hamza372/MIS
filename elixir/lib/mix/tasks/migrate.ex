defmodule Mix.Tasks.Migrate do
	use Mix.Task

	def run(["negative-fees"]) do
		Application.ensure_all_started(:sarkar)

		{:ok, res} = Postgrex.query(Sarkar.School.DB, "
		SELECT
			school_id,
			time,
			path,
			value
		FROM writes
		where path[4] = 'fees' and path[6] = 'amount'
		order by time desc 
		", [])

		negative = res.rows 
		|> Enum.filter(fn [sid, time, path, value] -> value != nil and sid != "cerp" end)
		|> Enum.filter(fn [sid, time, path, value] -> value < 0 end)

		IO.inspect Enum.count(negative)

		schools = Enum.reduce(negative, %{}, fn [sid, time, path, value], agg -> 

			t = DateTime.from_unix(time, :millisecond)
			IO.inspect t
			IO.puts "#{sid}: #{Enum.join(path, ",")} -> #{value}"
			case Map.has_key?(agg, sid) do
				true -> 
					existing = Map.get(agg, sid)
					new = [{path, value} | existing ]
					Map.put(agg, sid, new)
				false ->
					Map.put(agg, sid, [{path, value}])
			end
		end)

		Enum.map(schools, fn {k, v} -> 
			IO.puts "#{k}: #{Enum.count(v)}" 
		end)

		IO.puts "affected schools: #{Enum.count(schools)}"

	end

	# need to identify the payments amounts that should be positive but are negative.

	def run(["negative-fees-end"]) do

		blank_id = "____________________________________"
		
		Application.ensure_all_started(:sarkar)

		IO.puts "querying..."
		{:ok, res} = Postgrex.query(Sarkar.School.DB, "
		SELECT 
			school_id,
			path,
			value
		FROM flattened_schools
		WHERE path like 'students,#{blank_id},fees,#{blank_id},amount'
		", [])

		negative = res.rows 
			|> Enum.filter(fn [sid, path, value] -> sid != "cerp" and value < 0 end)

		schools = Enum.reduce(negative, %{}, fn [sid, path, value], agg -> 

			case Map.has_key?(agg, sid) do
				true ->
					existing = Map.get(agg, sid)
					new = [{String.split(path, ","), value} | existing]
					Map.put(agg, sid, new)
				false ->
					Map.put(agg, sid, [{String.split(path, ","), value}])
			end
		end)

		#Enum.map(schools, fn {k, v} -> 
		#	IO.puts "#{k}: #{Enum.count(v)}"
		#end)

		# TODO: this is to be replaced by a loop over all schools
		IO.inspect Map.keys(schools)

		Map.keys(schools)
		|> Enum.each(fn example_sid -> 
			IO.inspect example_sid

			example = Map.get(schools, example_sid)

			# probably better to just go and load this school into memory.
			start_school(example_sid)

			db = Sarkar.School.get_db(example_sid)

			results = Enum.reduce(example, 0, fn {path, value}, agg -> 

				[_, sid, _, fee_id, _] = path

				payments = Dynamic.get(db, ["students", sid, "payments"])

				relevant = Enum.filter(payments, fn {payment_id, payment} -> 
					# we are looking at values that are all negative because of our earlier filtering.
					# all of these values were supposed to be positive
					# they got saved as negative because of an editing bug
					# so scholarships which are supposed to be stored as negative amounts got double flipped into positive amounts
					# here we identify relevant payments which are incorrectly positive. these should be set to their negative values
					
					Map.get(payment, "fee_id") == fee_id and Map.get(payment, "amount") == -value 
				end)

				IO.puts "RELEVANT PAYMENTS"
				IO.inspect relevant

				fixed_writes = relevant
					|> Enum.map(fn {payment_id, payment} -> 

						fixed_path = ["db", "students", sid, "payments", payment_id, "amount"]

						%{
							"type" => "MERGE",
							"path" => fixed_path,
							"value" => value
						}

					end)
				
				fixed_writes = [%{
					"type" => "MERGE",
					"path" => ["db", "students", sid, "fees", fee_id, "amount"],
					"value" => -value
				} | fixed_writes]

				IO.puts "FIXED:"
				IO.inspect fixed_writes

				# sync these changes and it will reverse all incorrect payments and set the fee correctly


				prepared = Sarkar.School.prepare_changes(fixed_writes)
				# Sarkar.School.sync_changes(example_sid, "backend", prepared, :os.system_time(:millisecond))

				agg + Enum.count(relevant)
				# now check how many of the relevant are equal to the NEGATIVE of the messed up write

			end)
		
		end)
	end

	def run(["assign_max_students"]) do

		Application.ensure_all_started(:sarkar)
		case Postgrex.query(Sarkar.School.DB, "SELECT school_id, db from backup", []) do
			{:ok, res} -> 
				res.rows 
				|> Enum.each(fn ([school_id, school_db]) ->
					assign_max_students(school_id, -1)
				end) 
		end
	end

	def assign_max_students(school_id, limit) do

		path = ["db", "max_limit"]
		pkey = Enum.join(path, ",")

		write = %{
			"action" => %{
				"path" => path,
				"value" => limit,
				"type" => "MERGE"
			},
			"date" => :os.system_time(:millisecond)
		}

		changes = %{
			pkey => write
		}

		start_school(school_id)
		Sarkar.School.sync_changes(school_id, "backend-task", changes, :os.system_time(:millisecond))

	end

	def assign_trial_info() do
		curr_time = :os.system_time(:millisecond)
		
		{:ok, ref_schools} = Postgrex.query(Sarkar.School.DB,
			"SELECT
				id,
				MIN(time) as time 
			FROM mischool_referrals
			GROUP BY id",[])

		ref_sch = ref_schools.rows
			|> Enum.each(
				fn [school_id, time] ->
					start_school(school_id)
					Sarkar.School.sync_changes(school_id, "backend", %{
						"db,package_info" => %{
							"date" => curr_time,
							"action" => %{
								"path" => ["db","package_info"],
								"type" => "MERGE",
								"value" => %{
									"paid" => false,
									"trial_period" => 15,
									"date" => time
								}
							}
						}
					},curr_time)
				end
			)

		{:ok, "COMPLETED"}
	end

	def run(args) do
		Application.ensure_all_started(:sarkar)
		case Postgrex.query(Sarkar.School.DB, "SELECT school_id, db from backup", []) do
			{:ok, res} ->

				res.rows
				|> Enum.each(fn ([school_id, school_db]) ->

					{:ok, next_school} = case args do
						["fees"] -> {:ok, adjust_fees(school_id, school_db)}
						["payment"] -> {:ok, add_payment_name(school_id, school_db)}
						["users"] -> {:ok, adjust_users_table(school_id, school_db)}
						["fix-fees"] -> {:ok, remove_november_payments(school_id, school_db)}
						["duplicate-fees"] -> {:ok, remove_duplicate_payments(school_id, school_db)}
						["class-history"] -> {:ok, add_class_history(school_id, school_db)}
						["delete-all-fees-wisdom-sadia"] -> {:ok, delete_wisdom_sadia_fees(school_id, school_db)}
						["replay-wisdom-sadia"] -> {:ok, replay_writes_for_students(school_id, school_db)}
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
						{id, student 
							|> Map.put("fees", %{}) 
							|> Map.put("payments", %{})
						}
					end)
					|> Enum.into(%{})

				Map.put(school_db, "students", next_students)
			_ -> school_db
		end
	end

	defp replay_writes_for_students(school_id, school_db) do
		case school_id do
			id when  id == "sadiaschool" or id == "wisdomschool" or id == "six" -> 
				IO.puts "=========editing #{id}============"

				# get the writes in order
				{:ok, resp} = Postgrex.query(Sarkar.School.DB, 
					"SELECT time, type, path, value
					FROM writes
					WHERE school_id=$1 AND path[2] = 'students'
					ORDER BY time asc", [school_id])
				
				# for each write, execute Dynamic.(put|delete)[path] 
				next_db = resp.rows
					|> Enum.reduce(school_db, fn([ _time, type, [ _ | path], value ], agg) ->
						IO.inspect path
						case type do
							"MERGE" -> 
								Dynamic.put(agg, path, value)
							"DELETE" ->
								Dynamic.delete(agg, path)
							other -> 
								IO.puts "OTHERRRR"
								IO.inspect other
								agg
						end
					end)
			
				# IO.inspect Dynamic.get(next_db, ["students"])

				IO.inspect next_db == school_db
				next_db

			_ -> school_db
		end
	end

	defp add_class_history(_school_id, school_db) do

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


	defp add_payment_name(_school_id, school_db) do

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
						_other -> 
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

	defp adjust_users_table(_school_id, school_db) do
		
		next_users = Map.get(school_db, "users", %{})
			|> Enum.map(
				fn({id, user}) -> 
					# lookup against faculty
					IO.inspect(user)
					{_uid, faculty}= Enum.find(Map.get(school_db, "faculty"), fn ({_id, f}) -> 
						Map.get(f, "Username") == Map.get(user, "username")
					end) 
					IO.inspect faculty
					name = Map.get(faculty, "Name")

					{id, Map.put(user, "name", name)}
				end)
			|> Enum.into(%{})
		
		Map.put(school_db, "users", next_users)
	end

	defp remove_november_payments(_school_id, school_db) do
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

	defp remove_duplicate_payments(_school_id, school_db) do
		next_students = Map.get(school_db, "students", %{})
			|> Enum.map(
				fn({id, student}) ->
					
					payments = Map.get(student, "payments", %{})

					# if anything has same date and fee_id, remove one of them and is type owed
					{nextPayments, _existing} = payments
					|> Enum.reduce({%{}, %{}}, fn({id, payment}, {agg, existing}) -> 
						d = Map.get(payment, "date")
						fid = Map.get(payment, "fee_id")
						type = Map.get(payment, "type")
						nkey = "#{d}-#{fid}"

						if type == "OWED" and Map.has_key?(existing, nkey) do
							IO.puts "duplicate payment!!"
							IO.inspect Map.get(existing, nkey)
							IO.inspect payment
							{agg, existing}
						else
							{Map.put(agg, id, payment), Map.put(existing, nkey, true)}
						end

					end)

					{id, Map.put(student, "payments", nextPayments)}
				end)
			|> Enum.into(%{})
		Map.put(school_db, "students", next_students)

	end

	defp start_school(school_id) do
		case Registry.lookup(Sarkar.SchoolRegistry, school_id) do
			[{_, _}] -> {:ok}
			[] -> DynamicSupervisor.start_child(Sarkar.SchoolSupervisor, {Sarkar.School, {school_id}})
		end
	end
end