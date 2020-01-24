defmodule Sarkar.DB.Postgres do
	
	def query(db, querystring, params, opts \\ []) do
		IO.inspect opts 
		Postgrex.query(db, querystring, params, pool: DBConnection.Poolboy)
	end
end