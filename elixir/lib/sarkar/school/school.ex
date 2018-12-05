defmodule Sarkar.School do
	use GenServer

	def init(args) do
		{:ok, args}
	end

	def start_link({school_id}) do
		IO.puts "initting school #{school_id}"

		# state is school_id, map of writes, map of db.
		# TODO: map of writes: (path) -> date
		{db, writes} = Sarkar.Store.School.load(school_id)
		GenServer.start_link(__MODULE__, {school_id, writes, db}, name: {:via, Registry, {Sarkar.SchoolRegistry, school_id}})
	end

	# API 

	def sync_changes(school_id, client_id, changes, last_sync_date) do
		GenServer.call(via(school_id), {:sync_changes, client_id, changes, last_sync_date})
	end

	def get_db(school_id) do
		GenServer.call(via(school_id), {:get_db})
	end

	# SERVER

	def handle_call({:sync_changes, client_id, changes, last_sync_date}, _from, {school_id, writes, db} = state) do

		# map of changes.
		# key is path separated by comma
		# value is { action: {path, value}, date}

		have_all_in_memory? = writes 
			|> Enum.any?(fn {path_string, %{"date" => path_date}} -> last_sync_date > path_date end)

		writes = if not have_all_in_memory? do
				case Sarkar.Store.School.get_writes(school_id, last_sync_date) do
					{:ok, aug_writes} -> 
						IO.puts "SUCCESSFUL DB RECOVERY"
						aug_writes
					{:error, err} -> 
						IO.puts "ERROR ON DB RECOVERY"
						IO.inspect err
						writes
				end
		else
			writes
		end
		
		{nextDb, nextWrites, new_writes, last_date} = Enum.reduce(changes, {db, writes, %{}, 0}, fn({path_key, payload}, {agg_db, agg_writes, agg_new_writes, max_date}) -> 

			%{"action" => %{"path" => path, "type" => type, "value" => value}, "date" => date} = payload
			[prefix | p ] = path

			p_key = Enum.join(p, ",")
			write = %{"date" => date, "value" => value, "path" => path, "type" => type}

			case type do
				"MERGE" ->
					case Map.get(agg_writes, p_key) do
						nil -> 
							{Dynamic.put(agg_db, p, value), Map.put(agg_writes, p_key, write), Map.put(agg_new_writes, p_key, write), max(date, max_date)}
						%{"date" => prev_date, "value" => prev_value} when prev_date <= date ->
							{Dynamic.put(agg_db, p, value), Map.put(agg_writes, p_key, write), Map.put(agg_new_writes, p_key, write), max(date, max_date)}
						%{"date" => prev_date, "value" => prev_value} when prev_date > date ->
							{agg_db, agg_writes, agg_new_writes, max_date}
						other -> 
							IO.puts "OTHER!!!!!!!!!!!!!"
							IO.inspect other
							{Dynamic.put(agg_db, p, value), Map.put(agg_writes, p_key, write), Map.put(agg_new_writes, p_key, write), max(date, max_date)}
					end

				"DELETE" -> 
					case Map.get(agg_writes, p_key) do
						nil -> 
							{Dynamic.delete(agg_db, p), Map.put(agg_writes, p_key, write), Map.put(agg_new_writes, p_key, write), max(date, max_date)}
						%{"date" => prev_date} when prev_date <= date ->
							{Dynamic.delete(agg_db, p), Map.put(agg_writes, p_key, write), Map.put(agg_new_writes, p_key, write), max(date, max_date)}
						%{"date" => prev_date} when prev_date > date ->
							{agg_db, agg_writes, agg_new_writes, max_date}
						other ->
							IO.puts "OTHER!!!!!!!!!!!"
							IO.inspect other
							{Dynamic.delete(agg_db, p), Map.put(agg_writes, p_key, write), Map.put(agg_new_writes, p_key, write), max(date, max_date)}
					end
				other -> 
					IO.puts "unrecognized type"
					{agg_db, max_date}
			end
		end)

		# at this point we need to send the new snapshot to all clients that are up to date.

		# each client has sent its "last received data" date. when it connects, we should send all the latest writes that have happened since then, not the full db.
		# get that data for it here.

		relevant = nextWrites 
					|> Enum.filter(fn {path_string, %{"date" => path_date}} -> path_date > last_sync_date and not Map.has_key?(new_writes, path_string) end)
					|> Enum.into(%{})

		case map_size(new_writes) do
			# 0 -> {:reply, confirm_sync(last_date, nextDb), {school_id, nextWrites, nextDb}}
			0 -> {:reply, confirm_sync_diff(last_date, relevant), {school_id, nextWrites, nextDb}}
			_ -> 
				#broadcast(school_id, client_id, snapshot(nextDb))
				broadcast(school_id, client_id, snapshot_diff(new_writes))
				Sarkar.Store.School.save(school_id, nextDb, new_writes) #TODO: also store writes. Only keep latest writes per path in memory, but keep history on disk.
				Sarkar.Store.School.save(school_id, nextDb) #TODO: also store writes. Only keep latest writes per path in memory, but keep history on disk.
				# what do we do about attendance?? there are so many paths...
				# {:reply, confirm_sync(last_date, nextDb), {school_id, nextWrites, nextDb}}
				{:reply, confirm_sync_diff(last_date, relevant), {school_id, nextWrites, nextDb}}
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

	defp snapshot_diff(new_writes) do
		%{
			type: "SNAPSHOT_DIFF",
			new_writes: new_writes
		}
	end

	defp confirm_sync_diff(date, new_writes) do
		%{
			type: "CONFIRM_SYNC_DIFF",
			date: date,
			new_writes: new_writes # client should only have to check these against queued / pending writes.
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