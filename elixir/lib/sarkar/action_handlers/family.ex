defmodule Sarkar.ActionHandler.Family do

	def handle_action(%{"type" => "LOGIN", "payload" => %{"phone_number" => phone, "school_id" => school_id, "client_id" => client_id, "password" => password }}, state) do

		# they are logging in with phone number and school_id

	end

	def handle_action(%{"type" => "VERIFY", "payload" => %{"school_id" => school_id, "phone_number" => phone, "token" => token, "client_id" => client_id }}, state) do

	end

	def handle_action(%{"type" => "GET_FAMILY_INFO"}, %{school_id: school_id, client_id: client_id, phone_number: phone_number}) do

		# this will go into the school (start it if not exists)
		# and retreive the subset of state we need
		# and then return it

	end

	def handle_action(%{"type" => "SYNC", "payload" => %{"analytics" => analytics, "mutations" => mutations} = payload, "lastSnapshot" => last_sync_date} %{ school_id: school_id, client_id: client_id, phone_number: phone_number}) do
		# they will have to be able to edit some stuff in the future
		# for now, we will let them upload images.
	end

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