defmodule Sarkar.Auth.Dashboard do
	
	def login({id, client_id, password}) do
		# first check if password is correct.
		# if correct, generate a new token, put in db
		case Sarkar.DB.Postgres.query(Sarkar.School.DB,
			"SELECT * from mis_dashboard_auth where id=$1 AND password=$2", 
			[id, hash(password, 52)]) do
				{:ok, %Postgrex.Result{num_rows: 0}} -> {:error, "invalid login"}
				{:ok, res} -> 
					{:ok, token} = Sarkar.Auth.gen_token(id, client_id)

					[_name, _password, permissions] = List.first(res.rows)

					{:ok, token, permissions}
				{:error, err} ->
					IO.inspect err
					{:error, "database error while attempting login"}
		end
	end

	def create ({id, password, permissions }) do
		case Sarkar.DB.Postgres.query(Sarkar.School.DB,
			"INSERT INTO mis_dashboard_auth (id, password, permissions) values ($1, $2, $3)", 
			[id, hash(password, 52), permissions]) do
				{:ok, _res} -> 
					{:ok, "created #{id} with password #{password}"}
				{:error, err} -> 
					IO.inspect err
					{:error, err.postgres.detail}
		end
	end

	def hash(text, length) do
		:crypto.hash(:sha512, text)
		|> Base.url_encode64
		|> binary_part(0, length)
	end

end