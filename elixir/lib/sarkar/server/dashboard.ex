defmodule Sarkar.Server.Dashboard do

    def init(%{bindings: %{type: "hi"}} = req, state) do
		IO.puts "wowwww"
		req = :cowboy_req.reply(200, req)
		{:ok, req, state}
    end

    def init(%{bindings: %{type: "student_attendance"}, qs: query_string} = req, state) do

      IO.inspect URI.decode_query(query_string)

      {:ok, resp} = Postgrex.query(Sarkar.School.DB,
        "SELECT
				    to_timestamp(time/1000)::date::text as d, 
				    school_id,
            count(distinct path[3]) as students_marked
        FROM writes
        WHERE path[2] = 'students' and path[4] = 'attendance'
			  GROUP BY d, school_id
        ORDER BY d desc", [])
      #convert to JSON (read up on this)
      coordinates = resp.rows 
        |> Enum.map(fn [date, school_id, students_marked] -> %{"date" => date, "school_id" => school_id, "students_marked" => students_marked} end)

        {:ok, resp2} = Postgrex.query(Sarkar.School.DB,
        "
        SELECT count(*)
        FROM (
          select jsonb_object_keys(db->'students')
          from backup
          where school_id = 'darul-ehsan'
        ) as total_students", [])
      #convert to JSON 
        totalstudents = resp2.rows
      |> Enum.map(fn[total_students] -> %{"total_students" => total_students} end)

      json_data = Poison.encode!(%{data: coordinates, data2: totalstudents})
      

      req = :cowboy_req.reply(
        200, 
        %{"content-type" => "application/json", "cache-control" => "no-cache", "access-control-allow-methods" => "GET, OPTIONS", "access-control-allow-origin" => "*"},
        json_data,
        req
        )
		  {:ok, req, state}
  end

  def init(%{bindings: %{type: "teacher_attendance"}, qs: query_string} = req, state) do

    IO.inspect URI.decode_query(query_string)

    {:ok, resp} = Postgrex.query(Sarkar.School.DB,
      "SELECT
        to_timestamp(time/1000)::date::text as d,
        school_id,
        count(distinct path[3]) as teachers_marked
        FROM writes
        WHERE path[2] = 'faculty' and path[4] = 'attendance'
        GROUP BY d, school_id
        ORDER BY d desc", [])

    #convert to JSON (read up on this)
    coordinates = resp.rows
    |> Enum.map(fn[date, school_id, teachers_marked] -> %{"date" => date, "school_id" => school_id, "teachers_marked" => teachers_marked} end)

    {:ok, resp2} = Postgrex.query(Sarkar.School.DB,
    "
    SELECT count(*)
    FROM (
      select jsonb_object_keys(db->'faculty') 
      from backup 
      where school_id='darul-ehsan'
    ) as total_teachers", [])
    #convert to JSON
    [[ total_teachers ]] = resp2.rows

  json_data = Poison.encode!(%{data: coordinates, total_teachers: total_teachers})

  req = :cowboy_req.reply(
    200,
    %{"content-type" => "application/json", "cache-control" => "no-cache",  "access-control-allow-methods" => "GET, OPTIONS", "access-control-allow-origin" => "*"},
    json_data,
    req
    )
    {:ok, req, state}
  end




  def init(%{bindings: %{type: "fees"}, qs: query_string} = req, state) do
    IO.inspect URI.decode_query(query_string)
    
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
      
    #convert to JSON (read up on this)
    coordinates = resp.rows
    |> Enum.map(fn [date, school_id, unique_students, num_payments, total] -> %{ "date" => date, "school_id" => school_id, "unique_students" => unique_students, "num_payments" => num_payments, "total" => total} end)
  
    {:ok, resp2} = Postgrex.query(Sarkar.School.DB,
        "
        SELECT count(*)
        FROM (
          select jsonb_object_keys(db->'students') 
          from backup 
          where school_id='darul-ehsan'
        ) as total_students", [])

    [[ total_students ]] = resp2.rows

  json_data = Poison.encode!(%{data: coordinates, total_students: total_students})

  req = :cowboy_req.reply(
    200,
    %{"content_type" => "application/json", "cache-control" => "no-cache",  "access-control-allow-methods" => "GET, OPTIONS", "access-control-allow-origin" => "*"},
    json_data,
    req
    )
    {:ok, req, state}
  end

  def init(%{bindings: %{type: "exams"}} = req, state) do
    {:ok, resp} = Postgrex.query(Sarkar.School.DB,
    "SELECT 
				to_timestamp(time/1000)::date::text as d,
				school_id,
				count(distinct path[3]) as school_id,
				count(distinct path[5]) as exams 
			FROM writes 
			WHERE path[2] = 'students' and path[4] = 'exams'
			GROUP BY d, school_id
			ORDER BY d desc",
			[])
    coordinates = resp.rows
    |> Enum.map(fn [date, students_graded, school_id, exams] -> %{ "date" => date, "students_graded" => students_graded, "school_id" => school_id, "exams" => exams} end)

    {:ok, resp2} = Postgrex.query(Sarkar.School.DB,
    "
    SELECT count(*)
    FROM (
      select jsonb_object_keys(db->'students') 
      from backup 
      where school_id='darul-ehsan'
    ) as total_students", [])

[[ total_students ]] = resp2.rows

json_data = Poison.encode!(%{data: coordinates, total_students: total_students})    
    req = :cowboy_req.reply(
      200,
      %{"content_type" => "application/json", "cache-control" => "no-cache",  "access-control-allow-methods" => "GET, OPTIONS", "access-control-allow-origin" => "*"},
      json_data,
      req
    )
    {:ok, req, state}
  end
  def init(%{bindings: %{type: "sms"}} = req, state) do

		{:ok, resp} = Postgrex.query(Sarkar.School.DB,
			"SELECT
				to_timestamp(time/1000)::date::text as d, 
				school_id, 
				sum(CASE WHEN value->>'type' = 'ALL_STUDENTS' THEN (value->>'count')::int ELSE 0 END) AS ALL_STUDENTS,
				sum(CASE WHEN value->>'type' = 'ALL_TEACHERS' THEN (value->>'count')::int ELSE 0 END) AS ALL_TEACHERS,
				sum(CASE WHEN value->>'type' = 'TEACHER' THEN (value->>'count')::int ELSE 0 END) AS SINGLE_TEACHER,
				sum(CASE WHEN value->>'type' = 'FEE_DEFAULTERS' THEN (value->>'count')::int ELSE 0 END) AS FEE_DEFAULTERS,
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
    coordinates = resp.rows
    |> Enum.map(fn[date, school_id, all_students, all_teachers, single_teacher, fee_defaulters, student, class, attendance, fee, exam, prospective, total] -> %{"date" => date, "school_id" => school_id, "ALL_STUDENTS" => all_students, "ALL_TEACHERS" => all_teachers, "SINGLE_TEACHER" => single_teacher, "FEE_DEFAULTERS" => fee_defaulters, "STUDENT" => student, "CLASS" => class, "ATTENDANCE" => attendance, "FEE" => fee, "EXAM" => exam, "PROSPECTIVE" => prospective, "total" => total} end)

    json_data = Poison.encode!(%{data: coordinates})
    
    req = :cowboy_req.reply(
      200,
      %{"content_type" => "application/json", "cache-control" => "no-cache", "access-control-allow-methods" => "GET, OPTIONS", "access-control-allow-origin" => "*"},
      json_data,
      req
    )
    {:ok, req, state}
  end
end
