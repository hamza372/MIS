defmodule Sarkar.ActionHandler.Platform do
	
	def handle_action(%{"type" => "SET_FILTER"} = action, state) do

		{:reply, %{type: "success", payload: %{"hello" => "hey"}}, state}
	end

	def handle_action(action, state) do
		IO.inspect action
		IO.puts "NOT YET READY"
	end
end