defmodule Sarkar.Server.Analytics do
	
	def init(%{bindings: %{type: "hi"}} = req, state) do
		IO.puts "wowwww"
		req = :cowboy_req.reply(200, req)
		{:ok, req, state}
		
	end

	def init(%{bindings: %{type: "devices.csv"}} = req, state) do

		{:ok, data} = case Postgrex.query(Sarkar.School.DB,
		"SELECT school_id, client_id, to_timestamp(time/1000)::date::text as date, count(DISTINCT time) 
		FROM writes
		WHERE NOT (path[4]='payments' and value->>'type'='OWED')
		GROUP BY school_id, client_id, date 
		ORDER BY date desc",
		[]) do
				{:ok, resp} -> {:ok, resp.rows}
				{:error, err} -> {:error, err}
		end

		csv = [ ["school_id", "client_id", "date", "writes"] | data ]
		|> CSV.encode
		|> Enum.join()

		req = :cowboy_req.reply(
			200,
			%{"content-type" => "text/csv", "cache-control" => "no-cache"},
			csv,
			req
		)

		{:ok, req, state}

	end

	def init(%{bindings: %{type: "writes.csv"}} = req, state) do

		{:ok, data} = case Postgrex.query(Sarkar.School.DB,
		"SELECT school_id, to_timestamp(time/1000)::date::text as date, count(DISTINCT time) 
		FROM writes
		WHERE NOT (path[4]='payments' and value->>'type'='OWED')
		GROUP BY school_id, date 
		ORDER BY date desc",
		[]) do
				{:ok, resp} -> {:ok, resp.rows}
				{:error, err} -> {:error, err}
		end

		csv = [ ["school_id", "date", "writes"] | data ]
		|> CSV.encode
		|> Enum.join()

		req = :cowboy_req.reply(
			200,
			%{"content-type" => "text/csv", "cache-control" => "no-cache"},
			csv,
			req
		)

		{:ok, req, state}

	end

	def init(%{bindings: %{type: "raw-writes.csv"}} = req, state) do

		req1 = :cowboy_req.stream_reply(
			200,
			%{"content-type" => "text/csv", "cache-control" => "no-cache", "connection" => "keep-alive"},
			req
		)

		:cowboy_req.stream_body(
			IO.iodata_to_binary(NimbleCSV.RFC4180.dump_to_iodata([["school_id", "path", "value", "time", "type", "client_id", "sync_time"]])),
			:nofin,
			req1
		)

		Postgrex.transaction(Sarkar.School.DB, fn(conn) ->
			stream = Postgrex.stream(conn,
				"SELECT school_id, path, value, time, type, client_id, sync_time 
				FROM writes", [])

			stream
			|> Stream.map(fn res ->
				res.rows 
				|> Enum.map( fn [s, p, v, t, type, cid, st] -> [s, Poison.encode!(p), Poison.encode!(v), t, type, cid, st] end)
				|> Enum.map(fn row -> :cowboy_req.stream_body(IO.iodata_to_binary(NimbleCSV.RFC4180.dump_to_iodata([row])), :nofin, req1) end)
			end)
			|> Enum.to_list

		end, timeout: :infinity)

		:cowboy_req.stream_body("", :fin, req1)

		{:ok, req, state}
	end

	def init(%{bindings: %{type: "fees.csv"}} = req, state) do

		{:ok, resp} = Postgrex.query(Sarkar.School.DB,
			"SELECT 
				to_timestamp(time/1000)::date::text as d, 
				school_id, 
				count(distinct path[3]) as unique_students,
				count(distinct path[5]) as num_payments, 
				sum((value->>'amount')::float) as total
			FROM writes 
			WHERE path[2] = 'students' AND path[4] = 'payments' AND value->>'type' = 'SUBMITTED'
			GROUP BY d, school_id 
			ORDER BY d desc", [])
		

		csv = [ ["date", "school_id", "unique_students", "num_payments", "total"] | resp.rows] 
			|> CSV.encode
			|> Enum.join()
		
		req = :cowboy_req.reply(
			200,
			%{"content-type" => "text/csv", "cache-control" => "no-cache"},
			csv,
			req
		)

		{:ok, req, state}
	end

	def init(%{bindings: %{type: "exams.csv"}} = req, state) do
		{:ok, resp} = Postgrex.query(Sarkar.School.DB,
			"SELECT 
				to_timestamp(time/1000)::date::text as d,
				school_id,
				count(distinct path[3]) as students_graded,
				count(distinct path[5]) as exams 
			FROM writes 
			WHERE path[2] = 'students' and path[4] = 'exams'
			GROUP BY d, school_id
			ORDER BY d desc",
			[])

		csv = [ ["date", "school_id", "students_graded", "exams"] | resp.rows] 
			|> CSV.encode
			|> Enum.join()
		
		req = :cowboy_req.reply(
			200,
			%{"content-type" => "text/csv", "cache-control" => "no-cache"},
			csv,
			req
		)

		{:ok, req, state}
	end

	def init(%{bindings: %{type: "sign_ups.csv"}} = req, state) do
		{:ok, resp} = Postgrex.query(Sarkar.School.DB,
			"SELECT
				form ->> 'name' as Name,
				form ->> 'schoolName' as School,
				form ->> 'city' as City,
				form ->> 'packageName' as Package,
				form ->> 'phone' as Phone,
				to_timestamp((form->>'date')::bigint/1000) as Date
			FROM mischool_sign_ups",
			[])

		csv = [ ["Name", "School", "City", "Package", "Phone", "Date"] | resp.rows] 
			|> CSV.encode
			|> Enum.join()
		
		req = :cowboy_req.reply(
			200,
			%{"content-type" => "text/csv", "cache-control" => "no-cache"},
			csv,
			req
		)

		{:ok, req, state}
	end

	def init(%{bindings: %{type: "attendance.csv"}} = req, state) do
		{:ok, resp} = Postgrex.query(Sarkar.School.DB,
			"SELECT
				to_timestamp(time/1000)::date::text as d, 
				school_id,
				count(distinct path[3]) as students_marked 
			FROM writes
			WHERE path[2] = 'students' and path[4] = 'attendance'
			GROUP BY d, school_id
			ORDER BY d desc", [])

		csv = [ ["date", "school_id", "students_marked"] | resp.rows] 
			|> CSV.encode
			|> Enum.join()
		
		req = :cowboy_req.reply(
			200,
			%{"content-type" => "text/csv", "cache-control" => "no-cache"},
			csv,
			req
		)

		{:ok, req, state}
	end

	def init(%{bindings: %{type: "teacher_attendance.csv"}} = req, state) do
		{:ok, resp} = Postgrex.query(Sarkar.School.DB,
			"SELECT
				to_timestamp(time/1000)::date::text as d, 
				school_id,
				count(distinct path[3]) as teachers_marked 
			FROM writes
			WHERE path[2] = 'faculty' and path[4] = 'attendance'
			GROUP BY d, school_id
			ORDER BY d desc", [])

		csv = [ ["date", "school_id", "teachers_marked"] | resp.rows] 
			|> CSV.encode
			|> Enum.join()

		req = :cowboy_req.reply(
			200,
			%{"content-type" => "text/csv", "cache-control" => "no-cache"},
			csv,
			req
		)

		{:ok, req, state}
	end

	def init(%{bindings: %{type: "sms.csv"}} = req, state) do

		{:ok, resp} = Postgrex.query(Sarkar.School.DB,
			"SELECT
				to_timestamp(time/1000)::date::text as d, 
				school_id, 
				sum(CASE WHEN value->>'type' = 'ALL_STUDENTS' THEN (value->>'count')::int ELSE 0 END) AS ALL_STUDENTS,
				sum(CASE WHEN value->>'type' = 'ALL_TEACHERS' THEN (value->>'count')::int ELSE 0 END) AS ALL_TEACHERS,
				sum(CASE WHEN value->>'type' = 'TEACHER' THEN (value->>'count')::int ELSE 0 END) AS SINGLE_TEACHER,
				sum(CASE WHEN value->>'type' = 'FEE_DEFAULTERS' THEN (value->>'count')::int ELSE 0 END) AS FEE_DEAFULTERS,
				sum(CASE WHEN value->>'type' = 'STUDENT' THEN (value->>'count')::int ELSE 0 END) AS STUDENT,
				sum(CASE WHEN value->>'type' = 'CLASS' THEN (value->>'count')::int ELSE 0 END) AS CLASS,
				sum(CASE WHEN value->>'type' = 'ATTENDANCE' THEN (value->>'count')::int ELSE 0 END) AS ATTENDANCE,
				sum(CASE WHEN value->>'type' = 'FEE' THEN (value->>'count')::int ELSE 0 END) AS FEE,
				sum(CASE WHEN value->>'type' = 'EXAM' THEN (value->>'count')::int ELSE 0 END) AS EXAM,
				sum(CASE WHEN value->>'type' = 'PROSPECTIVE' THEN (value->>'count')::int ELSE 0 END) AS PROSPECTIVE,
				sum((value->>'count')::int) as total
			FROM writes
			WHERE path[2] = 'analytics' AND path[3] = 'sms_history'
			GROUP BY d, school_id
			ORDER BY d desc", [])
		
		csv = [ ["date", "school_id", "ALL_STUDENTS", "ALL_TEACHERS", "SINGLE_TEACHER", "FEE_DEAFULTERS","STUDENT","CLASS","ATTENDANCE","FEE", "EXAM", "PROSPECTIVE", "TOTAL"] | resp.rows] 
			|> CSV.encode
			|> Enum.join()
		
		req = :cowboy_req.reply(
			200,
			%{"content-type" => "text/csv", "cache-control" => "no-cache"},
			csv,
			req
		)

		{:ok, req, state}
	end

	def init(%{bindings: %{type: "expense.csv"}} = req, state) do 
		{:ok, resp} = Postgrex.query(Sarkar.School.DB,
			"SELECT 
				to_timestamp(time/1000)::date::text as d,
				school_id,
				count(distinct path[3]) as unique_expense,
				sum((value->> 'amount')::float) as total_amount
			FROM writes 
			WHERE path[2] = 'expenses' AND value ->> 'type' = 'PAYMENT_GIVEN' 
			GROUP BY d, school_id 
			ORDER BY d desc", [])

		csv = [ ["date", "school_id", "unique_expense", "total_amount"] | resp.rows ]
			|> CSV.encode
			|> Enum.join()
		
		req = :cowboy_req.reply(
			200,
			%{"content-type" => "text/csv", "cache-control" => "no-cache"},
			csv,
			req
		)

		{:ok, req, state}
	end

	def init(%{bindings: %{type: "referrals.csv"}} = req, state) do 

		{:ok, resp} = Postgrex.query(Sarkar.School.DB, 
		"SELECT
			to_timestamp(time/1000)::date::text as Date,
			id,
			value ->> 'area_manager_name' as name,
			value ->> 'agent_name' as agent_name,
			value ->> 'type_of_login' as type,
			value ->> 'package_name' as package,
			value ->> 'city' as City,
			value ->> 'office' as Office,
			value ->> 'notes' as Notes,
			value ->> 'owner_name' as owner_name
		FROM mischool_referrals", [])

		csv = [["date", "school_id", "area_manager_name", "agent_name", "type", "package", "city", "office", "notes", "owner_name"] | resp.rows]
			|> CSV.encode
			|> Enum.join()
		
		req = :cowboy_req.reply(
			200,
			%{"content-type" => "text/csv", "cache-control" => "no-cache"},
			csv,
			req
		)

		{:ok, req, state}
	end

	def init(req, state) do 
		req = :cowboy_req.reply(200, req)
		IO.inspect req
		{:ok, req, state}
	end

end