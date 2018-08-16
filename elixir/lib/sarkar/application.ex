defmodule Sarkar.Application do
	# See https://hexdocs.pm/elixir/Application.html
	# for more information on OTP Applications
	@moduledoc false

	use Application

	def start(_type, _args) do
		# List all child processes to be supervised
		children = [
			{ Registry, keys: :duplicate, name: Sarkar.ConnectionRegistry },
			{ Registry, keys: :unique, name: Sarkar.SchoolRegistry },
			{ DynamicSupervisor, name: Sarkar.SchoolSupervisor, strategy: :one_for_one },
			{
				Postgrex,
					name: Sarkar.School.DB,
					hostname: "localhost",
					username: "postgres",
					password: "postgres",
					database: "postgres",
					types: Sarkar.PostgrexTypes
			},
			Sarkar.Server
		]

		# See https://hexdocs.pm/elixir/Supervisor.html
		# for other strategies and supported options
		opts = [strategy: :one_for_one, name: Sarkar.Supervisor]
		Supervisor.start_link(children, opts)
	end
end
