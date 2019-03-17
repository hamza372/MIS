defmodule Sarkar.ActionHandler.Platform do
	
	# todo:
	# there will be a table of schools, who will have their data continuously updated (jsonb)
	# there will be a table of users with there data to be syncd
		# they will have history with school id's 
		# tinder for giving loans - yes, no
			# is there a guy who first will say whether we should make the loan to the school 
			# then theres a separate group that actually does it
			# if so, we want to let users mark yes/no on the list of schools
			# if school info changes since they last marked it, that info can come back up...
		# then there is a group that consumes the "yes" list / "ToDo" list and makes the calls.
	# make call means press the button (verify your phone number), save to db ( userid, incoming #, intended #), show # in ui
	# keep in memory for fast reply when call comes

	def handle_action(%{"type" => "SET_FILTER"} = action, state) do
		IO.inspect action
		{:reply, succeed(%{"type" => "nonsense"}), state}
	end

	def handle_action(%{"type" => "LOGIN", "client_id" => client_id, "payload" => %{"id" => id, "password" => password}}, state) do
		case Sarkar.Auth.login({id, client_id, password}) do
			{:ok, token} ->
				start_supplier(id)
				register_connection(id, client_id)
				sync_state = Sarkar.Supplier.get_sync_state(id)
				{:reply, succeed(%{token: token, sync_state: sync_state}), %{id: id, client_id: client_id}}
			{:error, message} -> {:reply, fail(message), %{}}
		end
	end

	def handle_action(%{"type" => "VERIFY", "payload" => %{"id" => id, "token" => token, "client_id" => client_id}}, state) do
		case Sarkar.Auth.verify({id, client_id, token}) do
			{:ok, _} ->
				start_supplier(id)
				register_connection(id, client_id)
				{:reply, succeed(), %{id: id, client_id: client_id}}
			{:error, msg} ->
				IO.inspect msg
				{:reply, fail(), state}
		end
	end

	def handle_action(%{"type" => "SYNC", "payload" => payload, "last_snapshot" => last_sync_date}, %{id: id, client_id: client_id} = state) do
		res = Sarkar.Supplier.sync_changes(id, client_id, payload, last_sync_date)
		{:reply, succeed(res), state}
	end

	def handle_action(%{"type" => "GET_SCHOOL_PROFILES", "payload" => payload}, %{id: id, client_id: client_id} = state) do
		
		ids = Map.get(payload, "school_ids", [])

		or_str = Stream.with_index(ids, 1)
			|> Enum.map(fn {_, i}-> 
				"id=$#{i}"
			end)
			|> Enum.join(" OR ")

		case Postgrex.query(Sarkar.School.DB, "SELECT id, db FROM platform_schools WHERE #{or_str}", ids) do
			{:ok, resp} ->
				dbs = resp.rows
				|> Enum.map(fn [id, db] -> {id, db} end)
				|> Enum.into(%{})

				{:reply, succeed(dbs), state}
			{:error, err} ->
				IO.inspect err
				{:reply, fail("db error"), state}
		end
	end

	def handle_action(action, state) do
		IO.inspect action
		IO.inspect state
		IO.puts "NOT YET READY"
		{:ok, state}
		# {:reply, fail(), state}
	end

	defp start_supplier(id) do
		case Registry.lookup(Sarkar.SupplierRegistry, id) do
			[{_, _}] -> {:ok}
			[] -> DynamicSupervisor.start_child(Sarkar.SupplierSupervisor, {Sarkar.Supplier, {id}})
		end
	end

	defp register_connection(id, client_id) do
		{:ok, _} = Registry.register(Sarkar.ConnectionRegistry, id, client_id)
	end

	defp fail(message) do
		%{type: "failure", payload: message}
	end

	defp fail() do
		%{type: "failure"}
	end

	defp succeed(payload) do
		%{type: "succeess", payload: payload}
	end

	defp succeed() do
		%{type: "success"}
	end
end