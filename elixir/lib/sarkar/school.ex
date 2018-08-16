defmodule Sarkar.School do
	use GenServer

	def start_link({school_id}) do
		IO.puts "initting school"
		IO.inspect school_id

		# state is school_id, map of writes, map of db.
		# map of writes: (path) -> date
		# maybe another thing we should include is 
		# each clients status

		IO.puts "starting school under registry id #{school_id}"
		GenServer.start_link(__MODULE__, {school_id, %{}, %{}}, name: {:via, Registry, {Sarkar.SchoolRegistry, school_id}})
	end

	# API 

	def sync_changes(school_id, client_id, changes) do
		GenServer.call(via(school_id), {:sync_changes, client_id, changes})
	end

	# SERVER

	def handle_call({:sync_changes, client_id, changes}, _from, {school_id, writes, db} = state) do
		IO.inspect changes

		# map of changes.
		# key is path separated by comma
		# value is { action: {path, value}, date}
		# we need to keep a dictionary of path/date to decide if we should execute that write
		# for now we'll just execute and last write wins.

		{nextDb, last_date} = Enum.reduce(changes, {db, 0}, fn {path_key, payload}, {agg_db, max_date} -> 
			%{ action: %{path: path, type: type, value: value}, date: date} = payload
			IO.inspect date

			[prefix | p ] = path
			IO.inspect prefix

			{Dynamic.put(agg_db, p, value), max(date, max_date)}
		end)

		# at this point we need to send the new snapshot to all clients that are up to date.
		# future: think about just sending the changes.

		broadcast(school_id, snapshot(nextDb))
		{:reply, confirm_sync(last_date, nextDb), {school_id, writes, nextDb}}
	end

	def handle_call(a, b, c) do 
		IO.inspect a
		IO.inspect b
		IO.inspect c

		{:reply, "no match...", c}
	end

	# generates action
	defp snapshot(db) do
		%{
			type: "SNAPSHOT",
			db: db
		}
	end

	defp confirm_sync(date, db) do
		%{
			type: "CONFIRM_SYNC",
			date: date,
			db: db
		}
	end

	defp via(school_id) do
		{:via, Registry, {Sarkar.SchoolRegistry, school_id}}
	end

	defp broadcast(school_id, message) do
		entries = Registry.lookup(Sarkar.ConnectionRegistry, school_id)
		for {pid, client_id} <- entries do
			send(pid, {:broadcast, message})
		end
	end

end