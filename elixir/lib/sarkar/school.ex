defmodule Sarkar.School do
	use GenServer

	def start_link({school_id}) do
		IO.puts "initting school"
		IO.inspect school_id

		GenServer.start_link(__MODULE__, {school_id, %{}, %{}}, name: {:via, Registry, {Sarkar.SchoolRegistry, school_id}})
	end

	# API 

	def sync_changes(pid, changes) do
		GenServer.call(pid, {:sync_changes, changes})
	end

	# SERVER

	def handle_call({:sync_changes, changes}, _from, {school_id, writes, db} = state) do
		IO.inspect changes

		# map of changes.
		# key is path separated by comma
		# value is { action: {path, value}, date}
		# we need to keep a dictionary of path/date to decide if we should execute that write
		# for now we'll just execute and last write wins.

		nextState = Enum.reduce(changes, fn {path_key, payload}, agg -> 
			%{ action: %{path: path, type: type, value: value }} = payload
			IO.inspect path
			Dynamic.put(db, path, value)
		end)

		IO.inspect nextState

		{:reply, "here", {school_id, writes, nextState}}
	end

	def handle_call(a, b, c) do 
		IO.inspect a
		IO.inspect b
		IO.inspect c

		{:reply, "no match...", c}
	end

end