defmodule Sarkar.Auth do

	def create({school_id, password}) do
		case Postgrex.query(Sarkar.School.DB,
			"INSERT INTO auth (id, password) values ($1, $2)", 
			[school_id, hash(password, 52)]) do
				{:ok, res} -> {:ok}
				{:error, err} -> 
					IO.inspect err
					{:error, "login failed"}
		end
	end

	def login({school_id, password}) do
		# first check if password is correct.
		# if correct, generate a new token, put in db
		case Postgrex.query(Sarkar.School.DB,
			"SELECT * from auth where id=$1 AND $password=$2", 
			[school_id, hash(password, 52)]) do
				{:ok, %Postgrex.Result{num_rows: 0}} -> {:error, "invalid login"}
				{:ok, rows} -> {:ok, gen_token(school_id)}

				{:error, err} ->
					IO.inspect err
					{:error, "database error while attempting login"}
		end
	end

	def gen_token(school_id) do

	end

	def hash(text, length) do
		:crypto.hash(:sha512, text)
		|> Base.url_encode64
		|> binary_part(0, length)
	end

end