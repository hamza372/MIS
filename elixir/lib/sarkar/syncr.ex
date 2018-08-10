defmodule Sarkar.Syncr do

	def init({school_id, client_id}) do
		IO.puts "initting / starting child"
		DynamicSupervisor.start_child(Sarkar.SchoolSupervisor, Sarkar.School, school_id)
	end

	def handle_sync(%{school_id: school_id, payload: payload}) do
		# payload is a map,
		# key is path separated by comma
		# value is action: action, date: timestamp
	end

end