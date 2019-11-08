defmodule Sarkar.ActionHandler.Dashboard do

	def handle_action(%{"type"=> "CREATE_NEW_SCHOOL", "payload" => %{ "username" => username, "password" => password, "limit" => limit, "value" => value }}, state) do		
			
		{:ok, resp} = Sarkar.Auth.create({username, password, limit, value })
			
		IO.inspect resp

		{:reply, succeed(resp), state}
	end

	def handle_action(%{ "type" => "UPDATE_REFERRALS_INFO", "payload" => %{ "school_id" => school_id, "value" => value }}, state) do
		case Sarkar.Auth.update_referrals_info({ school_id, value}) do
			{:ok, resp} ->
				{:reply, succeed(resp), state}
			{:err, resp} ->
				{:reply, fail("Updating Failed"), state}
		end
	end

	def handle_action(%{"type" => "UPDATE_SCHOOL_INFO",  "payload" => %{"school_id" => school_id, "merges" => merges}}, state) do
		
		case Registry.lookup(Sarkar.SchoolRegistry, school_id) do
			[{_, _}] -> {:ok}
			[] -> DynamicSupervisor.start_child(Sarkar.SchoolSupervisor, {Sarkar.School, {school_id}})
		end

		merges
			|> Enum.map( fn (merge) -> 
				Sarkar.School.sync_changes(school_id,"backend", merge, :os.system_time(:millisecond))
			end)
		
			{:reply, succeed("Successful"), state}

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