defmodule Sarkar.MixProject do
	use Mix.Project

	def project do
		[
			app: :sarkar,
			version: "0.1.0",
			elixir: "~> 1.7",
			start_permanent: Mix.env() == :prod,
			deps: deps()
		]
	end

	# Run "mix help compile.app" to learn about applications.
	def application do
		[
			extra_applications: [:logger],
			mod: {Sarkar.Application, []}
		]
	end

	# Run "mix help deps" to learn about dependencies.
	defp deps do
		[
			# {:dep_from_hexpm, "~> 0.3.0"},
			# {:dep_from_git, git: "https://github.com/elixir-lang/my_dep.git", tag: "0.1.0"},
			{:poison, "~> 3.0"},
			{:csv, "~> 2.3"},
			{:nimble_csv, "~> 0.3"},
			{:distillery, "~> 2.0"},
			{:cowboy, "~> 2.6.3", override: true, manager: :rebar3},
			{:uuid, "~> 1.1"},
			{:postgrex, "~>0.13.3"},
			{:dynamic, github: "ironbay/dynamic", sparse: "elixir"},
			{:tesla, "~> 1.2.0"},
			{:plug, "~> 1.5.0-rc.0", override: true},
			{:wobserver, github: "epinault/wobserver"}
		]
	end
end