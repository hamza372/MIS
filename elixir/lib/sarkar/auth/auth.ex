defmodule Sarkar.Auth do

	def create({id, password}) do
		{:ok, confirm_text } = case Sarkar.DB.Postgres.query(Sarkar.School.DB,
			"INSERT INTO auth (id, password) values ($1, $2)", 
			[id, hash(password, 52)]) do
				{:ok, _res} -> 
					{:ok, "created #{id} with password #{password}"}
				{:error, err} -> 
					IO.inspect err
					{:error, "creation failed"}
		end

		start_school(id)
		Sarkar.School.init_trial(id)

		{:ok, confirm_text}
	end

	def createTracked({ id, password, limit, value, role}) do 

		time = :os.system_time(:millisecond)

		case Postgrex.transaction(
			Sarkar.School.DB,
			fn(conn) ->
				case Sarkar.DB.Postgres.query(
					conn,
					"INSERT INTO auth (id, password) values ($1, $2)",
					[id, hash(password, 52)]
				) do
					{:ok, resp } -> {:ok, resp}
					{:error, err} ->
						DBConnection.rollback(
							conn,
							err
						)
				end

				case Sarkar.DB.Postgres.query(
					conn,
					"INSERT INTO mischool_referrals (id, time, value) VALUES ($1, $2, $3)",
					[id, time, value]
				) do
					{:ok, resp} -> {:ok, resp}
					{:error, err} ->
						DBConnection.rollback(
							conn,
							err
						)
				end
			end,
			pool: DBConnection.Poolboy
		) do
			{:ok, _resp} ->
				start_school(id)
				Sarkar.School.init_trial(id)

				if limit !== 0 do
					Sarkar.Store.School.save(id, %{
						"max_students" => %{
							"date" => :os.system_time(:millisecond),
							"value" => limit,
							"path" => ["db", "max_limit"],
							"type" => "MERGE",
							"client_id" => "backend"
						}
					})
				end

				area_manager = Map.get(value,"area_manager_name")
				strategy = Map.get(value,"type_of_login")
				user = Map.get(value, "user")

				confirm_text = case role do
					"AREA_MANAGER" ->
						"Area Manager #{area_manager} created login #{id} with password #{password} and Strategy #{strategy}"
					"ADMIN"->
						"Admin #{user} created login #{id} with password #{password} and Strategy #{strategy}"
					_ ->
						"#{user} created #{id} with password #{password}"
				end

				alert_message = Poison.encode!(%{"text" => confirm_text })
				{:ok, _resp} = Sarkar.Slack.send_alert(alert_message)

				{:ok, confirm_text}

			{:error, err} ->
				IO.puts "ERROR CREATING SCHOOL"
				IO.inspect err
				#Will send the failure reason
				{:err, err.postgres.detail}
		end
	end

	def login({id, client_id, password}) do
		# first check if password is correct.
		# if correct, generate a new token, put in db
		case Sarkar.DB.Postgres.query(Sarkar.School.DB,
			"SELECT * from auth where id=$1 AND password=$2", 
			[id, hash(password, 52)]) do
				{:ok, %Postgrex.Result{num_rows: 0}} -> {:error, "invalid login"}
				{:ok, _rows} -> gen_token(id, client_id)
				{:error, err} ->
					IO.inspect err
					{:error, "database error while attempting login"}
		end
	end

	def updatePassword({id, password}) do
		case Sarkar.DB.Postgres.query(Sarkar.School.DB,
			"UPDATE auth SET password=$2 WHERE id=$1", 
			[id, hash(password, 52)]) do
				{:ok, _res} -> 
					{:ok, "updated #{id} with new password #{password}"}
				{:error, err} -> 
					IO.inspect err
					{:error, "updating failed"}
		end
	end

	def update_referrals_info({ school_id, value}) do

		case Sarkar.DB.Postgres.query(Sarkar.School.DB,
		"UPDATE mischool_referrals SET value=$2 WHERE id=$1",
		[school_id,value]) do
			{:ok, _res} ->
				{:ok, "updates referral information for #{school_id}"}
			{:error, err} ->
				IO.inspect err
				{:error, "Updating Failed for #{school_id}"}
		end

	end

	def verify({id, client_id, token}) do
		case Sarkar.DB.Postgres.query(Sarkar.School.DB,
		"SELECT * FROM tokens WHERE id=$1 AND token=$2 AND client_id=$3",
		[id, hash(token, 12), client_id]) do
			{:ok, %Postgrex.Result{num_rows: 0}} -> {:error, "invalid token"}
			{:ok, _res} -> {:ok, "success"}
			{:error, err} ->
				IO.inspect err
				{:error, "error verifying token"}
		end
	end

	def gen_token(id, client_id) do
		token = :crypto.strong_rand_bytes(12)
			|> Base.url_encode64
			|> binary_part(0, 12)
		
		case Sarkar.DB.Postgres.query(Sarkar.School.DB, "INSERT INTO tokens (id, token, client_id) values ($1, $2, $3)", [id, hash(token, 12), client_id]) do
			{:ok, _res} -> {:ok, token}
			{:error, err} -> 
				IO.inspect err
				{:error, "error generating token"}
		end
	end

	defp start_school(school_id) do
		case Registry.lookup(Sarkar.SchoolRegistry, school_id) do
			[{_, _}] -> {:ok}
			[] -> DynamicSupervisor.start_child(Sarkar.SchoolSupervisor, {Sarkar.School, {school_id}})
		end
	end

	def hash(text, length) do
		:crypto.hash(:sha512, text)
		|> Base.url_encode64
		|> binary_part(0, length)
	end

end