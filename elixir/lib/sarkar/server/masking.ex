defmodule Sarkar.Server.Masking do

	def init(%{has_body: true} = req, state) do
		{:ok, body, _req2} = :cowboy_req.read_body(req)

		IO.inspect body

		{:ok, :cowboy_req.reply(200, req), state}
	end

	def init(req, state) do

		query_params = :cowboy_req.parse_qs(req) 
		|> Enum.into(%{})

		{school_name, forward} = case query_params do
			%{"dialed" => dialed, "caller_id" => incoming} -> 
				# look up incoming against supplier db.
				# then query that supplier for the mask pair.
				{:ok, resp} = Postgrex.query(Sarkar.School.DB, "
					SELECT id from suppliers where sync_state->'numbers'->>$1 is not null
					", [incoming])

				[[ supplier_id ]] = resp.rows
				IO.inspect supplier_id

				start_supplier(supplier_id)
				school_id = Sarkar.Supplier.get_school_from_masked(supplier_id, dialed)

				{:ok, resp2} = Postgrex.query(Sarkar.School.DB, "SELECT db->'pulled_schoolname', db->'phone_number' from platform_schools where id=$1", [school_id])
				[[ school_name, outgoing_number ]] = resp2.rows

				{school_name, outgoing_number}
			other ->
				IO.puts "unexpected query params"
				IO.inspect other
				[]
		end


		IO.puts "would have forwarded to #{school_name} #{forward}"
		{:ok, :cowboy_req.reply(
			200,
			%{"content-type" => "text/plain"},
			"03351419577",
			req), state}
	end

	defp start_supplier(id) do
		case Registry.lookup(Sarkar.SupplierRegistry, id) do
			[{_, _}] -> {:ok}
			[] -> DynamicSupervisor.start_child(Sarkar.SupplierSupervisor, {Sarkar.Supplier, {id}})
		end
	end
end