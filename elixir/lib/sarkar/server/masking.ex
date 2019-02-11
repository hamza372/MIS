defmodule Sarkar.Server.Masking do

	def init(%{has_body: true} = req, state) do
		{:ok, body, req2} = :cowboy_req.read_body(req)

		IO.inspect body

		{:ok, :cowboy_req.reply(200, req), state}
	end

	def init(req, state) do
		IO.inspect req

		query_params = :cowboy_req.parse_qs(req) 
		|> Enum.into(%{})

		forward = case query_params do
			%{"dialed" => dialed, "incoming" => incoming} -> 
				# look up incoming against supplier db.
				# then query that supplier for the mask pair.
				{:ok, resp} = Postgrex.query(Sarkar.School.DB, "
					SELECT id from suppliers where sync_state->'numbers'->>$1 is not null
					", [incoming])

				[[ supplier_id ]] = resp.rows
				IO.inspect supplier_id

				school_id = Sarkar.Supplier.get_school_from_masked(supplier_id, dialed)

				{:ok, resp2} = Postgrex.query(Sarkar.School.DB, "SELECT db->'phone_number' from platform_schools where id=$1", [school_id])
				[[ outgoing_number ]] = resp2.rows

				outgoing_number
			other ->
				IO.puts "unexpected query params"
				IO.inspect other
				[]
		end


		{:ok, :cowboy_req.reply(
			200,
			%{"content-type" => "text/plain"},
			forward,
			req), state}
	end
end