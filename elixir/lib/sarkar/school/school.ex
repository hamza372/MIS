defmodule Sarkar.School do
	use GenServer

	def init(args) do
		{:ok, args}
	end

	def start_link({school_id}) do
		IO.puts "initting school #{school_id}"

		# state is school_id, map of writes, map of db.
		# TODO: map of writes: (path) -> date

		GenServer.start_link(__MODULE__, {school_id, %{}, Sarkar.Store.School.load(school_id)}, name: {:via, Registry, {Sarkar.SchoolRegistry, school_id}})
	end

	# API 

	def sync_changes(school_id, client_id, changes) do
		GenServer.call(via(school_id), {:sync_changes, client_id, changes})
	end

	def get_db(school_id) do
		GenServer.call(via(school_id), {:get_db})
	end

	# SERVER

	def handle_call({:sync_changes, client_id, changes}, _from, {school_id, writes, db} = state) do

		# map of changes.
		# key is path separated by comma
		# value is { action: {path, value}, date}
		# we need to keep a dictionary of path/date to decide if we should execute that write
		# for now we'll just execute and last write wins.

		{nextDb, last_date} = Enum.reduce(changes, {db, 0}, fn({path_key, payload}, {agg_db, max_date}) -> 

			%{"action" => %{"path" => path, "type" => type, "value" => value}, "date" => date} = payload
			[prefix | p ] = path

			case type do
				"MERGE" -> 
					IO.puts "doing merge"
					{Dynamic.put(agg_db, p, value), max(date, max_date)}
				"DELETE" -> 
					IO.puts "doing delete"
					{Dynamic.delete(agg_db, p), max(date, max_date)}
				other -> 
					IO.puts "unrecognized type"
					{agg_db, max_date}
			end

		end)

		# at this point we need to send the new snapshot to all clients that are up to date.
		# TODO: think about just sending the changes.

		case length(Map.keys(changes)) do
			0 -> {:reply, confirm_sync(last_date, nextDb), {school_id, writes, nextDb}}
			_ -> 
				broadcast(school_id, client_id, snapshot(nextDb))
				Sarkar.Store.School.save(school_id, nextDb)
				{:reply, confirm_sync(last_date, nextDb), {school_id, writes, nextDb}}
		end
	end

	def handle_call({:get_db}, _from, {school_id, writes, db} = state) do
		{:reply, db, state}
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

	defp broadcast(school_id, sender_id, message) do

		Registry.lookup(Sarkar.ConnectionRegistry, school_id)
		|> Enum.filter(fn {pid, client_id}-> client_id != sender_id end)
		|> Enum.map(fn {pid, _} -> send(pid, {:broadcast, message}) end)

	end
end