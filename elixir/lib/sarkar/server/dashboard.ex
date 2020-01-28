defmodule Sarkar.Server.Dashboard do

	defp headers() do
		%{
			"content-type" => "application/json",
			"cache-control" => "no-cache",
			"access-control-allow-methods" => "GET, OPTIONS",
			"access-control-allow-origin" => "*",
			"access-control-allow-headers" => "*"
		}
	end

	def init(%{bindings: %{type: "hi"}} = req, state) do
		IO.puts "wowwww"
		req = :cowboy_req.reply(200, req)
		{:ok, req, state}
	end

	def init(%{bindings: %{type: "referrals"}} = req, state) do
		
		{:ok, resp } = Sarkar.DB.Postgres.query(Sarkar.School.DB,
		"SELECT * FROM mischool_referrals", [])

		referrals = resp.rows
			|> Enum.map(fn [school_id, time, value] -> %{"school_id" => school_id, "time" => time, "value" => value} end)

		json_resp = Poison.encode!(%{"referrals" => referrals})

		req = :cowboy_req.reply(
			200,
			headers(),
			json_resp,
			req
		)

		{:ok, req, state}
	end

	def init(%{bindings: %{type: "school_list"}} = req, state) do
		{:ok, resp} = Sarkar.DB.Postgres.query(Sarkar.School.DB,
		"SELECT
			DISTINCT school_id
		FROM flattened_schools",[])

		school_list = resp.rows
			|> Enum.map(fn [row] -> row end)

		json_resp = Poison.encode!(%{"school_list" => school_list})

		req = :cowboy_req.reply(
			200, 
			headers(),
			json_resp,
			req
		)

		{:ok, req, state}
	end

	def init(%{bindings: %{type: "school_info"}, qs: query_string} = req, state) do

		decoded_params = URI.decode_query(query_string)

		school_id = Map.get(decoded_params, "school_id")

		{:ok, student_limit} = Sarkar.DB.Postgres.query(Sarkar.School.DB,
			"SELECT
				value
			FROM flattened_schools
			WHERE school_id=$1 AND path=$2",
			[school_id,"max_limit"]
		)

		{:ok, package_info} = Sarkar.DB.Postgres.query(Sarkar.School.DB,
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
				|> Enum.reduce(%{},fn ([value, path], acc) -> 
					key = path
						|> String.split(",")
						|> List.last()
					Map.put(acc, key, value)
				end
				)
		end

		json_resp = Poison.encode!(%{ 
				"trial_info" => trial_info,
				"student_info" => max_limit 
			})

		req = :cowboy_req.reply(
			200, 
			headers(),
			json_resp,
			req
		)

		{:ok, req, state}
	end

	def init(%{bindings: %{type: "expense" }, qs: query_string } = req, state) do

		decoded_params = URI.decode_query(query_string)

		school_id = Map.get(decoded_params, "school_id")
		start_date = Map.get(decoded_params, "start_date")
			|> String.to_integer
		end_date = Map.get(decoded_params, "end_date")
			|> String.to_integer

		{:ok, resp} = Sarkar.DB.Postgres.query(Sarkar.School.DB,
			"SELECT
				to_timestamp(time/1000)::date as date,
				count(distinct path[3]) as expense_usage
				FROM writes 
				WHERE school_id = $1 and 
					path[2] = 'expenses' and 
					time >= $2 and 
					time <= $3
				GROUP BY date
				ORDER BY date asc", [school_id, start_date, end_date])

		list = resp.rows
					|> Enum.map( fn [date, expense_usage] -> 
						%{ "date" => date, "expense_usage" => expense_usage} 
					end)

		json_resp = Poison.encode!(%{"data" => list})

		req = :cowboy_req.reply(
			200, 
			headers(),
			json_resp,
			req
		)

		{:ok, req, state}
	end

	def init(%{bindings: %{type: "sms" }, qs: query_string } = req, state) do

		decoded_params = URI.decode_query(query_string)

		school_id = Map.get(decoded_params, "school_id")
		start_date = Map.get(decoded_params, "start_date")
					|> String.to_integer
		end_date = Map.get(decoded_params, "end_date")
					|> String.to_integer

		{:ok, resp} = Sarkar.DB.Postgres.query(Sarkar.School.DB,
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
				ORDER BY date asc", [school_id, start_date, end_date])

		list = resp.rows
					|> Enum.map( fn [date, sms_usage] -> 
						%{ "date" => date, "sms_usage" => sms_usage} 
					end)

		json_resp = Poison.encode!(%{"data" => list})

		req = :cowboy_req.reply(
			200, 
			headers(),
			json_resp,
			req
		)

		{:ok, req, state}
	end

	def init(%{bindings: %{type: "diary" }, qs: query_string } = req, state) do

		decoded_params = URI.decode_query(query_string)

		school_id = Map.get(decoded_params, "school_id")
		start_date = Map.get(decoded_params, "start_date")
			|> String.to_integer
		end_date = Map.get(decoded_params, "end_date")
			|> String.to_integer

		{:ok, resp} = Sarkar.DB.Postgres.query(Sarkar.School.DB,
			"SELECT
				to_timestamp(time/1000)::date as date,
				count(distinct path[3]) as diary_usage
				FROM writes 
				WHERE school_id = $1 and path[2] = 'diary' and time >= $2 and time <= $3
				GROUP BY date
				ORDER BY date asc", [school_id, start_date, end_date])

		list = resp.rows
					|> Enum.map( fn [date, diary_usage] -> %{ "date" => date, "diary_usage" => diary_usage} end)

		json_resp = Poison.encode!(%{"data" => list})

		req = :cowboy_req.reply(
			200, 
			headers(),
			json_resp,
			req
		)

		{:ok, req, state}
	end

	def init(%{bindings: %{type: "student_attendance"}, qs: query_string} = req, state) do

		decoded_params = URI.decode_query(query_string)

		start_date = Map.get(decoded_params, "start_date")
			|> String.to_integer
		end_date = Map.get(decoded_params, "end_date")
			|> String.to_integer
		school_id = Map.get(decoded_params, "school_id")

		{:ok, resp} = Sarkar.DB.Postgres.query(Sarkar.School.DB,
		"SELECT
			to_timestamp(time/1000)::date as d,
			school_id,
			count(distinct path[3]) as students_marked
		FROM writes
		WHERE school_id = $1 and path[2] = 'students' and path[4] = 'attendance' and time >= $2 and time <= $3
		GROUP BY d, school_id
		ORDER BY d asc",[school_id, start_date, end_date])
		#convert to JSON (read up on this)
		coordinates = resp.rows 
		|> Enum.map(fn [date, school_id, students_marked] -> %{"date" => date, "school_id" => school_id, "students_marked" => students_marked} end)

		{:ok, resp2} = Sarkar.DB.Postgres.query(Sarkar.School.DB,

		"SELECT count(*)
		FROM (
			select jsonb_object_keys(db->'students')
			from backup
			where school_id = $1
		) as total_students", [school_id])
		#convert to JSON 
		[[ total_students ]] = resp2.rows

		json_data = Poison.encode!(%{data: coordinates, total_students: total_students})
		
		
		req = :cowboy_req.reply(
			200,
			headers(),
			json_data,
			req
		)
		
		{:ok, req, state}
	end


	def init(%{bindings: %{type: "teacher_attendance"}, qs: query_string} = req, state) do

		decoded_params = URI.decode_query(query_string)

		start_date = Map.get(decoded_params, "start_date")
			|> String.to_integer
		end_date = Map.get(decoded_params, "end_date")
			|> String.to_integer

		school_id = Map.get(decoded_params, "school_id")

		{:ok, resp} = Sarkar.DB.Postgres.query(Sarkar.School.DB,
			"SELECT
				to_timestamp(time/1000)::date as d,
				school_id,
				count(distinct path[3]) as teachers_marked
			FROM writes
			WHERE path[2] = 'faculty' and path[4] = 'attendance' and school_id =$1 and time >= $2 and time <= $3
			GROUP BY d, school_id
			ORDER BY d asc", [school_id, start_date, end_date])

		#convert to JSON (read up on this)
		coordinates = resp.rows
		|> Enum.map(fn[date, school_id, teachers_marked] -> %{"date" => date, "school_id" => school_id, "teachers_marked" => teachers_marked} end)

		{:ok, resp2} = Sarkar.DB.Postgres.query(Sarkar.School.DB,
		"
		SELECT count(*)
		FROM (
			select jsonb_object_keys(db->'faculty') 
			from backup 
			where school_id= $1
		) as total_teachers", [school_id])
		#convert to JSON
		[[ total_teachers ]] = resp2.rows

		json_data = Poison.encode!(%{data: coordinates, total_teachers: total_teachers})

		req = :cowboy_req.reply(
			200,
			headers(),
			json_data,
			req
		)
		{:ok, req, state}
	end

	def init(%{bindings: %{type: "fees"}, qs: query_string} = req, state) do

		decoded_params = URI.decode_query(query_string)

		start_date = Map.get(decoded_params, "start_date")
			|> String.to_integer

		end_date = Map.get(decoded_params, "end_date")
			|> String.to_integer

		school_id = Map.get(decoded_params, "school_id")


		{:ok, resp} = Sarkar.DB.Postgres.query(Sarkar.School.DB,
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
			ORDER BY d asc", [school_id, start_date, end_date])
			
		#convert to JSON (read up on this)
		coordinates = resp.rows
		|> Enum.map(fn [date, school_id, unique_students, num_payments, total] -> %{ "date" => date, "school_id" => school_id, "unique_students" => unique_students, "num_payments" => num_payments, "total" => total} end)

		{:ok, resp2} = Sarkar.DB.Postgres.query(Sarkar.School.DB,
			"
			SELECT count(*)
			FROM (
				select jsonb_object_keys(db->'students') 
				from backup 
				where school_id= $1
			) as total_students", [school_id])

		[[ total_students ]] = resp2.rows

		json_data = Poison.encode!(%{data: coordinates, total_students: total_students})

		req = :cowboy_req.reply(
			200,
			headers(),
			json_data,
			req
		)
		{:ok, req, state}
	end


	def init(%{bindings: %{type: "exams"}, qs: query_string} = req, state) do

		decoded_params = URI.decode_query(query_string)

		start_date = Map.get(decoded_params, "start_date")
			|> String.to_integer
		end_date = Map.get(decoded_params, "end_date")
			|> String.to_integer
		school_id = Map.get(decoded_params, "school_id")

		{:ok, resp} = Sarkar.DB.Postgres.query(Sarkar.School.DB,
			"SELECT 
				to_timestamp(time/1000)::date as d,
				school_id,
				count(distinct path[3]) as students_graded,
				count(distinct path[5]) as exams 
			FROM writes 
			WHERE school_id = $1 and path[2] = 'students' and path[4] = 'exams' and time >= $2 and time <= $3
			GROUP BY d, school_id
			ORDER BY d asc", [school_id, start_date, end_date])
		coordinates = resp.rows
		|> Enum.map(fn [date, school_id, students_graded, exams] -> %{ "date" => date, "school_id" => school_id, "students_graded" => students_graded,  "exams" => exams} end)

		{:ok, resp2} = Sarkar.DB.Postgres.query(Sarkar.School.DB,
		"
		SELECT count(*)
		FROM (
			select jsonb_object_keys(db->'students') 
			from backup 
			where school_id= $1
		) as total_students", [school_id])

		[[ total_students ]] = resp2.rows

		json_data = Poison.encode!(%{data: coordinates, total_students: total_students})    
		
		req = :cowboy_req.reply(
			200,
			headers(),
			json_data,
			req
		)

		{:ok, req, state}

	end
end
