defmodule Sarkar.Server.Analytics do
	
	def init(%{bindings: %{type: "hi"}} = req, state) do
		IO.puts "wowwww"
		req = :cowboy_req.reply(200, req)
		{:ok, req, state}
		
	end

	def init(%{bindings: %{type: "writes.csv"}} = req, state) do

		{:ok, data} = case Postgrex.query(Sarkar.School.DB,
		"SELECT school_id, to_timestamp(time/1000)::date::text as date, count(*) 
		FROM writes
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

	def init(%{bindings: %{type: "platform-writes.csv"}} = req, state) do

		{:ok, data} = case Postgrex.query(Sarkar.School.DB,
		"SELECT id, to_timestamp(time/1000)::date::text as date, count(*) 
		FROM platform_writes
		GROUP BY id, date 
		ORDER BY date desc",
		[]) do
				{:ok, resp} -> {:ok, resp.rows}
				{:error, err} -> {:error, err}
		end

		csv = [ ["supplier_id", "date", "writes"] | data ]
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

	def init(%{bindings: %{type: "platform-events.csv"}} = req, state) do

		{:ok, data} = case Postgrex.query(Sarkar.School.DB,
		"SELECT 
			id, 
			to_timestamp((value->>'time')::bigint/1000)::date::text as date,
			path[3] as school_id,
			value->>'event' as event,
			value->'meta'->>'call_status' as call_status,
			value->'meta'->>'duration' as duration_seconds
		FROM platform_writes
		WHERE path[4] = 'history'
		ORDER BY date desc
		",
		[]) do
				{:ok, resp} -> {:ok, resp.rows}
				{:error, err} -> 
					IO.inspect err
					{:error, err}
		end

		csv = [ ["supplier_id", "date", "school_id", "event", "call_status", "duration"] | data ]
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

	def init(%{bindings: %{type: "platform-call-surveys.csv"}} = req, state) do
		{:ok, data} = case Postgrex.query(Sarkar.School.DB,
		"SELECT 
			id, 
			to_timestamp((value->>'time')::bigint/1000)::date::text as date,
			value->>'event' as event, 
			path[3] as school_id,
			value->'meta'->>'customer_interest' as customer_interest,
			value->'meta'->>'reason_rejected' as reason_rejected,
			value->'meta'->>'other_reason_rejected' as other_reason_rejected,
			value->'meta'->>'customer_likelihood' as customer_likelihood,
			value->'meta'->>'follow_up_meeting' as follow_up_meeting,
			value->'meta'->>'other_notes' as other_notes
		FROM platform_writes
		WHERE path[4] = 'history' AND value->>'event' = 'CALL_END_SURVEY'
		ORDER BY date desc
		",
		[]) do
			{:ok, resp} -> {:ok, resp.rows}
			{:error, err} -> 
				IO.inspect err
				{:error, err}
		end

		csv = [[
			"supplier_id",
			"date",
			"event",
			"school_id",
			"customer_interest",
			"reason_rejected",
			"other_reason_rejected",
			"customer_likelihood",
			"follow_up_meeting",
			"other_notes"] | data]
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

	def init(%{bindings: %{type: "platform-completed-survey.csv"}} = req, state) do
		{:ok, data} = case Postgrex.query(Sarkar.School.DB,
		"SELECT
			id, to_timestamp((value->>'time')::bigint/1000)::date::text as date,
			value->>'event' as event,
			path[3] as school_id,
			value->'meta'->>'reason_completed' as reason_completed
		FROM platform_writes
		WHERE path[4] = 'history' AND value->>'event' = 'MARK_COMPLETE_SURVEY'
		ORDER BY date desc", []) do
			{:ok, resp} -> {:ok, resp.rows}
			{:error, err} -> 
				IO.inspect err
				{:error, err}
		end

		csv = [[
			"supplier_id",
			"date",
			"event",
			"school_id",
			"reason_completed"
		]]
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