defmodule Sarkar.Server do

	def start_link(_opts) do

		IO.puts "starting server"

		{:ok, _} = :cowboy.start_clear(
			:http,
			[{ :port, 8080 }],
			%{
				:env => %{ :dispatch => config() }
			}
		)
	end

	def config do
		:cowboy_router.compile([
			{:_, [
				{"/ws", Sarkar.Websocket, []},
				{"/", Sarkar.Server.OK, []},
				{"/utils/:method", Sarkar.Server.Utils, []},
				{"/analytics/:type", Sarkar.Server.Analytics, []},
				{"/dashboard/:type", Sarkar.Server.Dashboard, []}
			]}
		])
	end

	def child_spec(_opts) do
		import Supervisor.Spec
		worker(__MODULE__, [12_000])
	end
end

defmodule Sarkar.Server.OK do
	def init(req, state) do
		req = :cowboy_req.reply(200, req)
		{:ok, req, state}
	end
end

defmodule Sarkar.Server.Utils do
	def init(%{bindings: %{method: "clear"}} = req, state) do
		req = :cowboy_req.reply(
			200,
			%{"Clear-Site-Data" => "cache"},
			"ok",
			req
		)

		{:ok, req, state}
	end
end