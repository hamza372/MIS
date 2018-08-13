defmodule Sarkar.School do
	use GenServer

	def start_link({school_id}) do
		IO.puts "initting school"
		IO.inspect school_id

		# state is school_id, map of writes, map of db.
		# map of writes: (path) -> date
		# maybe another thing we should include is 
		# each clients status

		# clients should have a few different status
		# on each connection, the client needs to send its queued up updates, even if its length 0
		# client state before sending its update is "CONNECTED_AWAITING_SYNC"
		# after sending its update, we reply with snapshot and set state to "CONNECTED_RECEIVED_SYNC"
		# after the client applies the snapshot, it should send confirmation "SNAPSHOT_APPLIED"
		# once it sends confirmation, we set status to "CONNECTED_UP_TO_DATE"
		# once disconnected/terminted, state is set to "DISCONNECTED"
		# each state should be a tuple with a date

		IO.puts "starting school under registry id #{school_id}"
		GenServer.start_link(__MODULE__, {school_id, %{}, %{}, %{}}, name: {:via, Registry, {Sarkar.SchoolRegistry, school_id}})
	end

	# API 

	def init_conn(school_id, client_id) do
		GenServer.call(via(school_id), {:init_conn, client_id})
	end

	def sync_changes(school_id, client_id, changes) do
		GenServer.call(via(school_id), {:sync_changes, client_id, changes})
	end

	# SERVER

	def handle_call({:init_conn, client_id}, _from, {school_id, writes, clients, db} = state) do
		{:reply, :ok, {school_id, writes, Map.put(clients, client_id, :CONNECTED_AWAITING_SYNC), db}}

	end

	def handle_call({:snapshot_applied, client_id}, _from, {school_id, writes, clients, db} = state) do
		{:reply, :ok, {school_id, writes, Map.put(clients, client_id, :UP_TO_DATE), db}}
	end

	def handle_call({:sync_changes, client_id, changes}, _from, {school_id, writes, clients, db} = state) do
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

		broadcast(school_id, clients, snapshot(nextDb))
		nextClients = Map.put(clients, client_id, :RECEIVED_SYNC)
		{:reply, confirm_sync(last_date, nextDb), {school_id, writes, Map.put(clients, client_id, :RECEIVED_SYNC), nextDb}}
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

	defp broadcast(school_id, client_states, message) do
		entries = Registry.lookup(Sarkar.ConnectionRegistry, school_id)
		for {pid, client_id} <- entries do
			case Map.get(client_states, client_id) do
				:CONNECTED_AWAITING_SYNC -> IO.puts "just awaitinn an initial sync"
				:RECEIVED_SYNC -> 
					IO.puts "waiting for this guy to ack the snapshot... but why bother"
					send(pid, {:broadcast, message})
				other -> IO.inspect other
			end
		end
	end

end