defmodule Sarkar.Server.Analytics do
	
	def init(%{bindings: %{type: "hi"}} = req, state) do
		IO.puts "wowwww"
		req = :cowboy_req.reply(200, req)
		{:ok, req, state}
		
	end

	def init(%{bindings: %{type: "writes.csv"}} = req, state) do

		{:ok, data} = case Postgrex.query(Sarkar.School.DB,
		"SELECT school_id, to_timestamp(time/1000)::date as date, count(*) 
		FROM writes
		GROUP BY school_id, date 
		ORDER BY date desc",
		[]) do
				{:ok, resp} -> {:ok, resp.rows}
				{:error, err} -> {:error, err}
		end

		csv = [ ["school_id", "date", "writes"] | data ]
		|> CSV.encode
		|> Enum.join("\n")

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
				to_timestamp(time/1000)::date as d, 
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
			|> Enum.join("\n")
		
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
				to_timestamp(time/1000)::date as d,
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
			|> Enum.join("\n")
		
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
				to_timestamp(time/1000)::date as d, 
				school_id,
				count(distinct path[3]) as students_marked 
			FROM writes
			WHERE path[2] = 'students' and path[4] = 'attendance'
			GROUP BY d, school_id
			ORDER BY d desc", [])

		csv = [ ["date", "school_id", "students_marked"] | resp.rows] 
			|> CSV.encode
			|> Enum.join("\n")
		
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
				to_timestamp(time/1000)::date as d, 
				school_id,
				count(distinct path[3]) as teachers_marked 
			FROM writes
			WHERE path[2] = 'faculty' and path[4] = 'attendance'
			GROUP BY d, school_id
			ORDER BY d desc", [])

		csv = [ ["date", "school_id", "teachers_marked"] | resp.rows] 
			|> CSV.encode
			|> Enum.join("\n")
		
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