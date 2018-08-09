defmodule Sarkar.Websocket do
	@behaviour :cowboy_websocket

	def init(req, state) do
		# probably should include the school id here
		# as part of state

		IO.puts "websocket connected"
		{:cowboy_websocket, req, %{}}
	end

	def terminate(_reason, _req, _state) do
		IO.puts "websocket terminate"
		:ok
	end

end