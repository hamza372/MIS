defmodule Sarkar.ActionHandler.Platform do
	
	def handle_action(%{"type" => "SET_FILTER"} = action, state) do

		# TODO: have the json doc loaded up somewhere to the k/v with concurrent reads/writes
		# execute search against it, respond with just the ids of valid items.
		# should search name of school and tehsil

		{:reply, %{type: "success", payload: %{"hello" => "hey"}}, state}
	end

	def handle_action(action, state) do
		IO.inspect action
		IO.puts "NOT YET READY"
	end
end