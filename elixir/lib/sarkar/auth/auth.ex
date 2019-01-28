defmodule Sarkar.Auth do

	def create({id, password}) do
		case Postgrex.query(Sarkar.School.DB,
			"INSERT INTO auth (id, password) values ($1, $2)", 
			[id, hash(password, 52)]) do
				{:ok, res} -> 
					{:ok, "created #{id} with password #{password}"}
				{:error, err} -> 
					IO.inspect err
					{:error, "creation failed"}
		end
	end

	def login({id, client_id, password}) do
		# first check if password is correct.
		# if correct, generate a new token, put in db
		case Postgrex.query(Sarkar.School.DB,
			"SELECT * from auth where id=$1 AND password=$2", 
			[id, hash(password, 52)]) do
				{:ok, %Postgrex.Result{num_rows: 0}} -> {:error, "invalid login"}
				{:ok, rows} -> gen_token(id, client_id)
				{:error, err} ->
					IO.inspect err
					{:error, "database error while attempting login"}
		end
	end

	def verify({id, client_id, token}) do
		case Postgrex.query(Sarkar.School.DB,
		"SELECT * FROM tokens WHERE id=$1 AND token=$2 AND client_id=$3",
		[id, hash(token, 12), client_id]) do
			{:ok, %Postgrex.Result{num_rows: 0}} -> {:error, "invalid token"}
			{:ok, res} -> {:ok, "success"}
			{:error, err} -> 
				IO.inspect err
				{:error, "error verifying token"}
		end
	end

	def gen_token(id, client_id) do
		token = :crypto.strong_rand_bytes(12)
			|> Base.url_encode64
			|> binary_part(0, 12)
		
		case Postgrex.query(Sarkar.School.DB, "INSERT INTO tokens (id, token, client_id) values ($1, $2, $3)", [id, hash(token, 12), client_id]) do
			{:ok, res} -> {:ok, token}
			{:error, err} -> 
				IO.inspect err
				{:error, "error generating token"}
		end
	end

	def hash(text, length) do
		:crypto.hash(:sha512, text)
		|> Base.url_encode64
		|> binary_part(0, length)
	end

end