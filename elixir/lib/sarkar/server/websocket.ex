defmodule Sarkar.Websocket do
	@behaviour :cowboy_websocket

	def init(req, state) do

		query = %{"school_id" => school_id, "client_id" => client_id} = String.split(req.qs, ["&", "="])
			|> Enum.chunk_every(2)
			|> Enum.map(fn [a, b] -> {a, b} end)
			|> Map.new

		IO.puts "websocket connected"
		{:cowboy_websocket, req, %{school_id: school_id, client_id: client_id}}
	end

	# there are going to be 2 types of requests.
	# actually maybe only one for now.
	# send their updates, get a snapshot back.
	# and also register a new school - this will need some sales access...
	# will need a db of sales logins, and/or a sales portal.

	def websocket_init(%{school_id: school_id, client_id: client_id} = state) do

		# register so we can send messages later
		{:ok, _} = Registry.register(Sarkar.ConnectionRegistry, school_id, client_id)

		# make sure school genserver is started
		DynamicSupervisor.start_child(Sarkar.SchoolSupervisor, {Sarkar.School, {school_id}})

		{:ok, state}
	end


	def websocket_handle({:text, "ping"}, state) do
		{:ok, state}
	end

	def websocket_handle({:text, content}, %{school_id: school_id, client_id: client_id} = state) do
		%{
			type: type,
			payload: payload
		} = msg = Poison.decode!(content, [keys: :atoms])

		case type do
			"SYNC" -> 
				res = Sarkar.School.sync_changes(school_id, client_id, payload)
				{:reply, {:text, Poison.encode!(res)}, state}
			other -> 
				IO.puts "type is not SYNC"
				IO.puts other
				{:ok, state}
		end
	end

	def websocket_info({:broadcast, json}, state) do
		IO.puts "broadcasting"
		{:reply, {:text, Poison.encode!(json)}, state}
	end

	def websocket_info(msg, state) do
		IO.inspect msg
	end


	def terminate(_reason, _req, _state) do
		IO.puts "websocket terminate"
		:ok
	end

end