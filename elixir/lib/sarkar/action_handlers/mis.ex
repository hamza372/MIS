defmodule Sarkar.ActionHandler.Mis do

	def handle_action(%{ "type" => "LOGIN",  "payload" => %{"school_id" => school_id, "client_id" => client_id, "password" => password }}, state) do
		case Sarkar.Auth.login({school_id, client_id, password}) do
			{:ok, token} ->

				parent = self()

				start_school(school_id)
				register_connection(school_id, client_id)

				spawn fn ->
					db = Sarkar.School.get_db(school_id)

					send(parent, {:broadcast, %{
						"type" => "LOGIN_SUCCEED",
						"db" => db,
						"token" => token,
						"school_id" => school_id
					}})
				end

				{:reply, succeed(%{status: "SUCCESS"}), %{school_id: school_id, client_id: client_id}}

			{:error, message} -> 
				{:reply, fail(message), %{}}
		end
	end

	def handle_action(%{"type" => "VERIFY", "payload" => %{"school_id" => school_id, "token" => token, "client_id" => client_id}}, state) do
		case Sarkar.Auth.verify({school_id, client_id, token}) do
			{:ok, _} ->
				start_school(school_id)
				register_connection(school_id, client_id)
				{:reply, succeed(), %{school_id: school_id, client_id: client_id}}
			{:error, msg} ->
				IO.puts "#{school_id} has error #{msg}"
				{:reply, fail(), state}
		end
	end

	def handle_action(%{"type"=> "SIGN_UP", "sign_up_id" => sign_up_id, "payload" => %{"city" => city, "name" => name, "packageName" => packageName, "phone" => phone, "schoolName" => schoolName }}, state) do		
		payload = %{"city" => city, "name" => name, "packageName" => packageName, "phone" => phone, "schoolName" => schoolName }
		
		{:ok, resp} = Postgrex.query(Sarkar.School.DB, 
		"INSERT INTO mischool_sign_ups (id,form) VALUES ($1, $2)",
		[sign_up_id, payload])

		alert_message = Poison.encode!(%{"text" => "New Sign-Up\nSchool Name: #{schoolName},\nPhone: #{phone},\nPackage: #{packageName},\nName: #{name},\nCity: #{city}"})
		
		{:ok, resp} = Sarkar.Slack.send_alert(alert_message)

		{:reply, succeed(), state}
	end

	def handle_action(
		%{
			"type" => "SYNC",
			"payload" => %{"analytics" => analytics, "mutations" => mutations },
			"lastSnapshot" => last_sync_date
		},
		%{
			school_id: school_id,
			client_id: client_id
		} = state
	) do

		mutation_res = if map_size(mutations || %{}) > 0 do
			Sarkar.School.sync_changes(school_id, client_id, mutations, last_sync_date)
		end

		analytics_res = Sarkar.Analytics.record(school_id, client_id, analytics, last_sync_date)

		res = %{
			"mutations" => mutation_res,
			"analytics" => analytics_res,
		}

		{:reply, succeed(res), state}
	end

	def handle_action(%{"type" => "SYNC", "payload" => payload, "lastSnapshot" => last_sync_date}, %{school_id: school_id, client_id: client_id} = state) do

		res = Sarkar.School.sync_changes(school_id, client_id, payload, last_sync_date)

		{:reply, succeed(res), state}

	end

	def handle_action(%{"type" => "SMS", "payload" => payload}, %{school_id: school_id, client_id: client_id} = state) do

		IO.puts "HANDLING SMS FROM #{school_id}"
		IO.inspect payload
		{:reply, succeed(), state}
	end 

	def handle_action(%{"type" => "SYNC", "payload" => payload, "school_id" => school_id}, state) do

		changes = payload |> Map.keys |> Enum.count 
		IO.puts "school #{school_id} has not authenticated the connection, and is trying to make #{changes} changes."
		IO.inspect state

		{:reply, fail("Please update your mischool app to the latest version."), state}
	end

	def handle_action(%{"type" => type, "payload" => payload} = msg, state) do
		IO.puts "it is likely you have not authenticated. no handler exists for this combination of state and message"
		IO.inspect type
		IO.inspect msg 
		IO.inspect state
		{:reply, fail("Please update your mischool app to the latest version."), state}
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