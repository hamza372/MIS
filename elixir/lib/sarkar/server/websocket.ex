defmodule Sarkar.Websocket do
	@behaviour :cowboy_websocket

	def init(req, state) do
		# probably should include the school id here
		# as part of state

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

	def websocket_handle({:text, "ping"}, state) do
		{:ok, state}
	end

	def websocket_init(%{school_id: school_id, client_id: client_id} = state) do
		{:ok, _} = Registry.register(Sarkar.ConnectionRegistry, school_id, client_id)

		res = DynamicSupervisor.start_child(Sarkar.SchoolSupervisor, {Sarkar.School, {school_id}})
		IO.inspect res

		{:ok, state}
	end

	def websocket_handle({:text, content}, state) do
		IO.inspect content

		%{
			type: type,
			school_id: school_id,
			payload: payload
		} = msg = Poison.decode!(content, [keys: :atoms])

		case type do
			"SYNC" -> 
				res = Registry.lookup(Sarkar.SchoolRegistry, school_id)
				IO.inspect res
				case res do
					[{pid, _}] -> 
						newthing = Sarkar.School.sync_changes(pid, payload)
						IO.inspect newthing
					other -> 
						IO.inspect other
						IO.puts "PROBLEM"
					end
			other -> 
				IO.puts "type is not SYNC"
				IO.puts other
		end

		{:ok, state}
	end


	def terminate(_reason, _req, _state) do
		IO.puts "websocket terminate"
		:ok
	end

end