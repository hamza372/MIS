defmodule Sarkar.ActionHandler.Dashboard do

	def handle_action(
		%{
			"type" => "SCHOOL_LIST",
			"client_id" => client_id,
			"payload" => %{
				"id" => id
			}
		},
		state
	) do

		{:ok, resp} = Sarkar.DB.Postgres.query(
			Sarkar.School.DB,
			"SELECT
				DISTINCT school_id
			FROM flattened_schools",
			[]
		)

		school_list = resp.rows |> Enum.map(fn [row] -> row end)

		{:reply, succeed(%{"school_list" => school_list}), state}
	end

	def handle_action(
		%{
			"type" => "GET_REFERRALS_INFO",
			"client_id" => client_id,
			"payload" => %{
				"id" => id
			}
		},
		state
	) do
		{:ok, resp } = Sarkar.DB.Postgres.query(
			Sarkar.School.DB,
			"SELECT * FROM mischool_referrals", 
			[]
		)

		referrals = resp.rows |> Enum.map(
			fn [school_id, time, value] -> 
				%{"school_id" => school_id, "time" => time, "value" => value} 
			end
		)

		{:reply, succeed(%{"referrals" => referrals }), state}
	end

	def handle_action(
		%{
			"type" => "GET_SCHOOL_INFO",
			"client_id" => client_id,
			"payload" => %{
				"school_id" => school_id
			}
		},
		state
	) do
		# SCHOOL_INFO
		{:ok, student_limit} = Sarkar.DB.Postgres.query(
			Sarkar.School.DB,
			"SELECT
				value
			FROM flattened_schools
			WHERE school_id=$1 AND path=$2",
			[school_id,"max_limit"]
		)

		{:ok, package_info} = Sarkar.DB.Postgres.query(
			Sarkar.School.DB,
			"SELECT
				value,
				path
			FROM flattened_schools
			WHERE school_id=$1 AND path LIKE $2",
			[school_id,"package_info%"]
		)

		max_limit = case length(student_limit.rows) do
			0 ->
				%{"max_limit" => -1}
			_ ->
				[ [amount] ] = student_limit.rows
				%{ "max_limit" => amount }
		end

		trial_info = case length(package_info.rows) do
			0 ->
				%{ "date" => -1, "paid" => false, "trial_period" => 15 }
			_ -> 
				package_info.rows
				|> Enum.reduce(
					%{},
					fn ([value, path], acc) -> 
						key = path
							|> String.split(",")
							|> List.last()
						Map.put(acc, key, value)
					end
				)
		end

		{:ok, meta} = case Sarkar.DB.Postgres.query(
			Sarkar.School.DB,
			"SELECT
				value
			FROM mischool_referrals
			WHERE id=$1",
			[school_id]
		) do
			{:ok, %Postgrex.Result{num_rows: 0}} -> {:ok, %{}}
			{:ok, resp} -> 
				[[ meta ]] = resp.rows
				{:ok, meta}
		end

		{:reply, succeed(%{"trial_info" => trial_info, "student_info" => max_limit, "meta" => meta }), state}
	end

	def handle_action(
		%{
			"type" => "EXPENSE_DATA",
			"client_id" => client_id,
			"payload" => %{
				"school_id" => school_id,
				"start_date" => start_date,
				"end_date" => end_date
			}
		},
		state
	) do
		
		{:ok, resp} = Sarkar.DB.Postgres.query(
			Sarkar.School.DB,
			"SELECT
				to_timestamp(time/1000)::date as date,
				count(distinct path[3]) as expense_usage
			FROM writes 
			WHERE school_id = $1 and 
				path[2] = 'expenses' and 
				time >= $2 and 
				time <= $3
			GROUP BY date
			ORDER BY date asc", [school_id, start_date, end_date]
		)

		list = resp.rows |> Enum.map( 
			fn [date, expense_usage] -> 
				%{ 
					"date" => date, 
					"expense_usage" => expense_usage
				} 
			end
		)

		{:reply, succeed(%{"data" => list }), state}
	end

	def handle_action(
		%{
			"type" => "SMS_DATA",
			"client_id" => client_id,
			"payload" => %{
				"school_id" => school_id,
				"start_date" => start_date,
				"end_date" => end_date
			}
		},
		state
	) do
		{:ok, resp} = Sarkar.DB.Postgres.query(
			Sarkar.School.DB,
			"SELECT
				to_timestamp(time/1000)::date as date,
				count(value ->> 'count') as sms_usage
			FROM writes
			WHERE school_id = $1 and 
				path[2] = 'analytics' and 
				path[3] = 'sms_history' and
				time >= $2 and 
				time <= $3
			GROUP BY date
			ORDER BY date asc", [school_id, start_date, end_date]
		)

		list = resp.rows |> Enum.map( 
			fn [date, sms_usage] -> 
				%{ 
					"date" => date, 
					"sms_usage" => sms_usage
				} 
			end
		)

		{:reply, succeed(%{"data" => list }), state}
	end

	def handle_action(
		%{
			"type" => "DIARY_DATA",
			"client_id" => client_id,
			"payload" => %{
				"school_id" => school_id,
				"start_date" => start_date,
				"end_date" => end_date
			}
		},
		state
	) do
		{:ok, resp} = Sarkar.DB.Postgres.query(
			Sarkar.School.DB,
			"SELECT
				to_timestamp(time/1000)::date as date,
				count(distinct path[3]) as diary_usage
			FROM writes 
			WHERE school_id = $1 and path[2] = 'diary' and time >= $2 and time <= $3
			GROUP BY date
			ORDER BY date asc", [school_id, start_date, end_date]
		)

		list = resp.rows |> Enum.map( 
			fn [date, diary_usage] -> 
				%{ 
					"date" => date, 
					"diary_usage" => diary_usage
				} 
			end
		)

		{:reply, succeed(%{"data" => list }), state}
	end

	def handle_action(
		%{
			"type" => "STUDENT_ATTENDANCE_DATA",
			"client_id" => client_id,
			"payload" => %{
				"school_id" => school_id,
				"start_date" => start_date,
				"end_date" => end_date
			}
		},
		state
	) do

		{:ok, resp} = Sarkar.DB.Postgres.query(
			Sarkar.School.DB,
			"SELECT
				to_timestamp(time/1000)::date as d,
				school_id,
				count(distinct path[3]) as students_marked
			FROM writes
			WHERE school_id = $1 and path[2] = 'students' and path[4] = 'attendance' and time >= $2 and time <= $3
			GROUP BY d, school_id
			ORDER BY d asc",[school_id, start_date, end_date]
		)
		
		coordinates = resp.rows |> Enum.map(
			fn [date, school_id, students_marked] -> 
				%{
					"date" => date, 
					"school_id" => school_id, 
					"students_marked" => students_marked
				} 
			end
		)

		{:ok, resp2} = Sarkar.DB.Postgres.query(
			Sarkar.School.DB,
			"SELECT count(*)
			FROM (
				select jsonb_object_keys(db->'students')
				from backup
				where school_id = $1
			) as total_students", [school_id]
		)

		[[ total_students ]] = resp2.rows
		
		{:reply, succeed(%{"data" => coordinates, "total_students" => total_students }), state}
	end

	def handle_action(
		%{
			"type" => "TEACHER_ATTENDANCE_DATA",
			"client_id" => client_id,
			"payload" => %{
				"school_id" => school_id,
				"start_date" => start_date,
				"end_date" => end_date
			}
		},
		state
	) do

		{:ok, resp} = Sarkar.DB.Postgres.query(
			Sarkar.School.DB,
			"SELECT
				to_timestamp(time/1000)::date as d,
				school_id,
				count(distinct path[3]) as teachers_marked
			FROM writes
			WHERE path[2] = 'faculty' and path[4] = 'attendance' and school_id =$1 and time >= $2 and time <= $3
			GROUP BY d, school_id
			ORDER BY d asc", [school_id, start_date, end_date]
		)

		coordinates = resp.rows |> Enum.map(
			fn [date, school_id, teachers_marked] -> 
				%{
					"date" => date, 
					"school_id" => school_id, 
					"teachers_marked" => teachers_marked
				} 
			end
		)

		{:ok, resp2} = Sarkar.DB.Postgres.query(
			Sarkar.School.DB,
			"SELECT count(*)
			FROM (
				select jsonb_object_keys(db->'faculty') 
				from backup 
				where school_id= $1
			) as total_teachers", [school_id]
		)

		[[ total_teachers ]] = resp2.rows

		{:reply, succeed(%{"data" => coordinates, "total_teachers" => total_teachers }), state}
	end

	def handle_action(
		%{
			"type" => "FEES_DATA",
			"client_id" => client_id,
			"payload" => %{
				"school_id" => school_id,
				"start_date" => start_date,
				"end_date" => end_date
			}
		},
		state
	) do
		{:ok, resp} = Sarkar.DB.Postgres.query(
			Sarkar.School.DB,
			"SELECT
				to_timestamp(time/1000)::date as d,
				school_id,
				count(distinct path[3]) as unique_students,
				count(distinct path[5]) as num_payments,
				sum((value->>'amount')::float) as total
			FROM writes
			WHERE school_id = $1 and path[2] = 'students' AND path[4] = 'payments' AND value->>'type' = 'SUBMITTED' and 
				time >= $2 and time <= $3
			GROUP BY d, school_id
			ORDER BY d asc", [school_id, start_date, end_date]
		)

		coordinates = resp.rows |> Enum.map(
			fn [date, school_id, unique_students, num_payments, total] -> 
				%{ 
					"date" => date, 
					"school_id" => school_id, 
					"unique_students" => unique_students, 
					"num_payments" => num_payments, 
					"total" => total
				}
			end
		)

		{:ok, resp2} = Sarkar.DB.Postgres.query(
			Sarkar.School.DB,
			"SELECT count(*)
			FROM (
				select jsonb_object_keys(db->'students') 
				from backup 
				where school_id= $1
			) as total_students", [school_id]
		)

		[[ total_students ]] = resp2.rows

		{:reply, succeed(%{"data" => coordinates, "total_students" => total_students }), state}
	end

	def handle_action(
		%{
			"type" => "EXAMS_DATA",
			"client_id" => client_id,
			"payload" => %{
				"school_id" => school_id,
				"start_date" => start_date,
				"end_date" => end_date
			}
		},
		state
	) do 
		{:ok, resp} = Sarkar.DB.Postgres.query(
			Sarkar.School.DB,
			"SELECT 
				to_timestamp(time/1000)::date as d,
				school_id,
				count(distinct path[3]) as students_graded,
				count(distinct path[5]) as exams 
			FROM writes 
			WHERE school_id = $1 and path[2] = 'students' and path[4] = 'exams' and time >= $2 and time <= $3
			GROUP BY d, school_id
			ORDER BY d asc", [school_id, start_date, end_date]
		)
		coordinates = resp.rows |> Enum.map(
			fn [date, school_id, students_graded, exams] -> 
				%{ 
					"date" => date, 
					"school_id" => school_id, 
					"students_graded" => students_graded,  
					"exams" => exams
				} 
			end
		)

		{:ok, resp2} = Sarkar.DB.Postgres.query(
			Sarkar.School.DB,
			"SELECT count(*)
			FROM (
				select jsonb_object_keys(db->'students') 
				from backup 
				where school_id= $1
			) as total_students", [school_id]
		)

		[[ total_students ]] = resp2.rows
	
		{:reply, succeed(%{"data" => coordinates, "total_students" => total_students }), state}
	end

	def handle_action(
		%{
			"type" => "LOGIN",
			"client_id" => client_id,
			"payload" => %{
				"id" => id,
				"password" => password
			}
		}, 
		state
	) do
		case Sarkar.Auth.Dashboard.login({ id, client_id, password }) do
			{:ok, token, permissions} -> 
				{:reply, succeed(%{ id: id, token: token, permissions: permissions }), %{ id: id, client_id: client_id}}
			{:error, err} -> 
				{:reply, fail(err), state}
		end
	end

	def handle_action(
		%{
			"type" => "CREATE_USER",
			"payload" => %{
				"name" => name,
				"password" => password,
				"permissions" => permissions
			}
		},
		state
	) do
		case Sarkar.Auth.Dashboard.create({ name, password, permissions }) do
			{:ok, resp} ->
				{:reply, succeed(resp), state}
			{:error, err} ->
				{:reply, fail(err), state} 
		end
	end

	def handle_action(%{"type" => "VERIFY", "payload" => %{"id" => id, "token" => token, "client_id" => client_id}}, state) do
		case Sarkar.Auth.verify({id, client_id, token}) do
			{:ok, _} ->
				{:reply, succeed(), %{id: id, client_id: client_id}}
			{:error, msg} ->
				IO.puts "#{id} has error #{msg}"
				{:reply, fail(), state}
		end
	end

	def handle_action(%{"type"=> "CREATE_NEW_SCHOOL", "payload" => %{ "username" => username, "password" => password, "limit" => limit, "value" => value }}, state) do		
		case Sarkar.Auth.createTracked({username, password, limit, value }) do 
			{:ok, resp} ->
				IO.inspect resp
				{:reply, succeed(resp), state}
			{:err, msg} ->
				{:reply, fail(msg), state}
		end
	end

	def handle_action(%{ "type" => "UPDATE_REFERRALS_INFO", "payload" => %{ "school_id" => school_id, "value" => value }}, state) do
		case Sarkar.Auth.update_referrals_info({ school_id, value}) do
			{:ok, resp} ->
				{:reply, succeed(resp), state}
			{:err, resp} ->
				{:reply, fail("Updating Failed"), state}
		end
	end

	def handle_action(%{"type" => "UPDATE_SCHOOL_INFO",  "payload" => %{"school_id" => school_id, "merges" => merges}}, state) do
		
		case Registry.lookup(Sarkar.SchoolRegistry, school_id) do
			[{_, _}] -> {:ok}
			[] -> DynamicSupervisor.start_child(Sarkar.SchoolSupervisor, {Sarkar.School, {school_id}})
		end

		merges
			|> Enum.map( fn (merge) -> 
				Sarkar.School.sync_changes(school_id,"backend", merge, :os.system_time(:millisecond))
			end)
		
			{:reply, succeed("Successful"), state}

	end

	defp fail(message) do
		%{type: "failure", payload: message}
	end

	defp fail() do
		%{type: "failure"}
	end

	defp succeed(payload) do
		%{type: "succeess", payload: payload}
	end

	defp succeed() do
		%{type: "success"}
	end

end