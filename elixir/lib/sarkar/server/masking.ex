defmodule Sarkar.Server.Masking do

	def init(%{has_body: true} = req, state) do
		{:ok, body, _req2} = :cowboy_req.read_body(req)

		IO.inspect body

		{:ok, :cowboy_req.reply(200, req), state}
	end

	def init(req, state) do

		query_params = :cowboy_req.parse_qs(req) 
		|> Enum.into(%{})

		# TODO: handle different events with different code blocks inside this case
		# i.e. if we are passing call_end or call_start events
		{school_name, forward} = case query_params do
			%{"dialed" => dialed, "callerid" => incoming, "event" => event_type, "unique_id" => uid} -> 
				# look up incoming against supplier db.
				# then query that supplier for the mask pair.
				{:ok, resp} = Postgrex.query(Sarkar.School.DB, "
					SELECT id from suppliers where sync_state->'numbers'->>$1 is not null
					", [incoming])

				case resp.rows do
					[[ supplier_id ]] ->
						IO.inspect supplier_id

						start_supplier(supplier_id)
						school_id = Sarkar.Supplier.get_school_from_masked(supplier_id, dialed)

						{:ok, resp2} = Postgrex.query(Sarkar.School.DB, "SELECT db->'school_name', db->'phone_number' from platform_schools where id=$1", [school_id])
						[[ school_name, outgoing_number ]] = resp2.rows

						case event_type do
							"call_start" -> 
								Sarkar.Supplier.call_event("CALL_START", supplier_id, incoming, school_id, nil)
							"call_end" -> 
								%{ "duration" => duration, "call_status" => call_status} = query_params
								Sarkar.Supplier.call_event("CALL_END", supplier_id, incoming, school_id, %{
									"duration" => duration,
									"call_status" => call_status,
									"unique_id" => uid
								})
							other -> 
								IO.puts "unexpected event type: #{other}"
								"UNKNOWN"
						end

						{school_name, outgoing_number}

					other -> 
						IO.puts "number is not from a supplier"
						# we check if its one of the schools calling back.
						# if it is, then do a lookup against all the mask_pairs->masked_num->school_id=$1
						{:ok, resp} = Postgrex.query(Sarkar.School.DB, "
							SELECT refcode FROM platform_schools WHERE 
								phone_number=$1 OR
								phone_number_1=$1 OR
								phone_number_2=$1 OR
								phone_number_3=$1 OR
								owner_phonenumber=$1 OR
								pulled_phonenumber=$1 OR
								alt_phone_number=$1", [incoming])
						
						case resp.rows do
							[[ school_id ]] -> 
								# find the supplier
								{:ok, resp2} = Postgrex.query(Sarkar.School.DB, "
									SELECT id from suppliers where sync_state->'mask_pairs'->$1->'school_id' = $2
								", [dialed, school_id])
								
								case resp2.rows do 
									[[ supplier_id ]] -> 
										number = Sarkar.Supplier.get_last_caller(supplier_id, school_id)
										Sarkar.Supplier.call_event("CALL_BACK", supplier_id, number, school_id, nil)

										{supplier_id, number}
									[[ supplier_id ] | more] -> 
										IO.puts "More than one supplier found. Should really use the one that called most recently"
										IO.inspect more
										number = Sarkar.Supplier.get_last_caller(supplier_id, school_id)
										Sarkar.Supplier.call_event("CALL_BACK", supplier_id, number, school_id, nil)

										{supplier_id, "0#{number}"}
									other ->
										IO.puts "didn't find a supplier who has the number that was dialed: #{school_id}: #{dialed}"
										IO.inspect other
										{"not-found", "04238301513"}
								end
							other -> 
								IO.puts "didn't find a school which has this number listed #{incoming}"
								IO.inspect other
								{"not-found", "04238301513"}
						end
				end
			other ->
				IO.puts "unexpected query params"
				IO.inspect other
				{"not-found-at-all", "04238301513"}
		end

		IO.puts "would have forwarded to #{school_name} #{forward}"

		{:ok, :cowboy_req.reply(
			200,
			%{"content-type" => "text/plain"},
			forward,
			req), state}
	end

	defp start_supplier(id) do
		case Registry.lookup(Sarkar.SupplierRegistry, id) do
			[{_, _}] -> {:ok}
			[] -> DynamicSupervisor.start_child(Sarkar.SupplierSupervisor, {Sarkar.Supplier, {id}})
		end
	end
end