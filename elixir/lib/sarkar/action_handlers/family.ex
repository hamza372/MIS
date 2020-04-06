defmodule Sarkar.ActionHandler.Family do

	def handle_action(%{"type" => type, "payload" => payload} = msg, state) do
		IO.puts "it is likely you have not authenticated. no handler exists for this combination of state and message"
		IO.inspect type
		IO.inspect msg 
		IO.inspect state
		{:reply, fail("Please update your mischool app to the latest version."), state}
	end

	defp start_school(school_id) do
		case Registry.lookup(Sarkar.SchoolRegistry, school_id) do
			[{_, _}] -> {:ok}
			[] -> DynamicSupervisor.start_child(Sarkar.SchoolSupervisor, {Sarkar.School, {school_id}})
		end
	end

	defp register_connection(school_id, client_id) do
		{:ok, _} = Registry.register(Sarkar.ConnectionRegistry, school_id, client_id)
	end

	defp fail(message) do
		%{type: "failure", payload: message}
	end

	defp fail() do
		%{type: "failure"}
	end

	defp succeed(payload) do
		%{type: "succeess", payload: payload}
	end

	defp succeed() do
		%{type: "success"}
	end
end