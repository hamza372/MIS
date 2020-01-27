defmodule Sarkar.DB.Postgres do
	
	def query(db, querystring, params, opts \\ []) do
		Postgrex.query(db, querystring, params, pool: DBConnection.Poolboy)
	end
end