defmodule Sarkar.Websocket do
	@behaviour :cowboy_websocket

	def init(req, state) do
		# probably should include the school id here
		# as part of state

		IO.puts "websocket connected"
		{:cowboy_websocket, req, %{}}
	end

	# there are going to be 2 types of requests.
	# actually maybe only one for now.
	# send their updates, get a snapshot back.
	# and also register a new school -- this will need some sales access...
	# will need a db of sales logins, and/or a sales portal.

	def terminate(_reason, _req, _state) do
		IO.puts "websocket terminate"
		:ok
	end

end