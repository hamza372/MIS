defmodule Sarkar.ActionHandler.Mis do

	def handle_action(%{"type" => "LOGIN", "payload" => %{"school_id" => school_id, "client_id" => client_id, "password" => password}}, state) do
		case Sarkar.Auth.login({school_id, client_id, password}) do
			{:ok, token} -> 
				start_school(school_id)
				register_connection(school_id, client_id)
				db = Sarkar.School.get_db(school_id)
				{:reply, succeed(%{token: token, db: db}), %{school_id: school_id, client_id: client_id}}
			{:error, message} -> {:reply, fail(message), %{}}
		end
	end

	def handle_action(%{"type" => "VERIFY", "payload" => %{"school_id" => school_id, "token" => token, "client_id" => client_id}}, state) do
		case Sarkar.Auth.verify({school_id, client_id, token}) do
			{:ok, _} -> 
				start_school(school_id)
				register_connection(school_id, client_id)
				{:reply, succeed(), %{school_id: school_id, client_id: client_id}}
			{:error, msg} -> 
				IO.inspect msg
				{:reply, fail(), state}
		end
	end

	def handle_action(%{"type" => "SYNC", "payload" => payload}, %{school_id: school_id, client_id: client_id} = state) do
		res = Sarkar.School.sync_changes(school_id, client_id, payload)
		{:reply, succeed(res), state}
	end

	def handle_action(%{"type" => "SMS", "payload" => payload}, %{school_id: school_id, client_id: client_id} = state) do

		IO.puts "HANDLING SMS"
		IO.inspect payload
		{:reply, succeed(), state}
	end 

	def handle_action(%{"type" => type, "payload" => payload}, state) do
		IO.puts "it is likely you have not authenticated. no handler exists for this combination of state and message"
		IO.inspect type
		IO.inspect payload
		IO.inspect state
		{:ok, state}
	end

	# def handle_action(%{type: "CREATE_SCHOOL", payload: %{school_id: school_id, password: password}}, state) do
	# 	case Sarkar.Auth.create({school_id, password}) do
	# 		{:ok} -> {:reply, succeed(), state}
	# 		{:error, message} -> {:reply, fail(message), state}
	# 	end
	# end

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