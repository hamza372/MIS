defmodule Sarkar.ActionHandler.Platform do
	
	def handle_action(%{"type" => "SET_FILTER"} = action, state) do

		# TODO: have the json doc loaded up somewhere to the k/v with concurrent reads/writes
		# execute search against it, respond with just the ids of valid items.
		# should search name of school and tehsil

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