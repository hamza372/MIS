defmodule Sarkar.ActionHandler do

	def handle_action(%{"client_type" => "mis"} = action, state) do
		Sarkar.ActionHandler.Mis.handle_action(action, state)
	end

	def handle_action(%{"client_type" => "dashboard"} = action, state) do
		Sarkar.ActionHandler.Dashboard.handle_action(action, state)
	end

	def handle_action(action, state) do
		IO.inspect action
		IO.inspect state

		IO.puts "uh oh"
	end

end