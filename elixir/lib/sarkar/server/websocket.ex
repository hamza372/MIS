defmodule Sarkar.Websocket do
	@behaviour :cowboy_websocket

	def init(req, state) do

		# query = %{"school_id" => school_id, "client_id" => client_id} = String.split(req.qs, ["&", "="])
		# 	|> Enum.chunk_every(2)
		# 	|> Enum.map(fn [a, b] -> {a, b} end)
		# 	|> Map.new

		#{:cowboy_websocket, req, %{school_id: school_id, client_id: client_id}}
		{:cowboy_websocket, req, %{}}
	end

	# there are going to be 2 types of requests.
	# actually maybe only one for now
	# send their updates, get a snapshot back.
	# and also register a new school - this will need some sales access...
	# will need a db of sales logins, and/or a sales portal.

	def websocket_init(%{school_id: school_id, client_id: client_id} = state) do

		# register so we can send messages later
		{:ok, _} = Registry.register(Sarkar.ConnectionRegistry, school_id, client_id)

		# make sure school genserver is started
		# but don't restart if dont need to. 
		case Registry.lookup(Sarkar.SchoolRegistry, school_id) do
			[{_, _}] -> {:ok, state}
			[] -> DynamicSupervisor.start_child(Sarkar.SchoolSupervisor, {Sarkar.School, {school_id}})
		end

		{:ok, state}
	end

	def websocket_init(state) do
		{:ok, state}
	end


	def websocket_handle({:text, "ping"}, state) do
		{:ok, state}
	end


	def websocket_handle({:text, content}, state) do
		json = Poison.decode!(content, [keys: :atoms])

		handle_json(json, state)
	end

	def handle_json(%{key: message_key, payload: %{type: type, payload: payload} = action}, state) do
		case handle_action(action, state) do
			{:reply, msg, state} -> {:reply, {:text, Poison.encode!(%{key: message_key, payload: msg})}, state}
			other -> 
				IO.puts "unexpected return from handle_action"
				IO.inspect other
				{:ok, state}
		end
	end

	def handle_json(json, state) do
		IO.inspect json

		{:ok, state}
	end

	def handle_action(%{type: "AUTH", payload: %{school_id: school_id, client_id: client_id, password: password}}, state) do
		case Sarkar.Auth.login({school_id, password}) do
			{:ok, token, db} -> {:reply, %{type: "success", token: token, db: db}, %{school_id: school_id, client_id: client_id}}
			{:error, message} -> {:reply, %{type: "error", message: message}, %{}}
		end
	end

	def handle_action(%{type: "CREATE_SCHOOL", payload: %{school_id: school_id, password: password}}) do
		case Sarkar.Auth.create({school_id, password}) do
			{:ok} -> {:reply, %{type: "success"}, state}
			{:error, message} -> {:reply, %{type: "error", message: message}, state}
		end
	end

	def handle_action(%{type: "SYNC", payload: payload}, state) do
		res = Sarkar.School.sync_changes(school_id, client_id, payload)
		{:reply, res, state}
	end

	def handle_action(%{type: type, payload: payload}, state) do
		IO.puts "type is not SYNC"
		IO.inspect type
		IO.inspect payload
		{:ok, state}
	end

	def websocket_handle({:text, content}, %{school_id: school_id, client_id: client_id} = state) do
		%{
			key: message_key,
			payload: %{
				type: type,
				payload: payload
			}
		} = msg = Poison.decode!(content, [keys: :atoms])

		case type do
			"SYNC" -> 
				res = Sarkar.School.sync_changes(school_id, client_id, payload)
				{:reply, {:text, Poison.encode!(%{key: message_key, payload: res})}, state}
			other -> 
				IO.puts "type is not SYNC"
				IO.puts other
				{:ok, state}
		end
	end

	def websocket_info({:broadcast, json}, state) do
		{:reply, {:text, Poison.encode!(json)}, state}
	end

	def websocket_info(msg, state) do
		IO.inspect msg
	end


	def terminate(_reason, _req, _state) do
		:ok
	end

end