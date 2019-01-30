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
				register_connection(id, client_id)
				{:reply, succeed(%{token: token}), %{id: id, client_id: client_id}}
			{:error, message} -> {:reply, fail(message), %{}}
		end
	end

	def handle_action(%{"type" => "VERIFY", "payload" => %{"id" => id, "token" => token, "client_id" => client_id}}, state) do
		case Sarkar.Auth.verify({id, client_id, token}) do
			{:ok, _} ->
				register_connection(id, client_id)
				{:reply, succeed(), %{id: id, client_id: client_id}}
			{:error, msg} ->
				IO.inspect msg
				{:reply, fail(), state}
		end
	end

	def handle_action(action, state) do
		IO.inspect action
		IO.puts "NOT YET READY"
		{:reply, fail(), state}
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