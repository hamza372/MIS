defmodule Sarkar.Supplier do
	use GenServer

	def init(args) do
		{:ok, args}
	end

	def start_link({id}) do
		IO.puts "initting supplier #{id}"

		# state is school_id, map of writes, map of db.
		{sync_state, writes} = Sarkar.Store.Supplier.load(id)

		GenServer.start_link(
			__MODULE__,
			{id, writes, sync_state},
			name: {:via, Registry, {Sarkar.SupplierRegistry, id}})
	end

	# API 

	def sync_changes(id, client_id, changes, last_sync_date) do
		GenServer.call(via(id), {:sync_changes, client_id, changes, last_sync_date})
	end

	def get_sync_state(id) do
		GenServer.call(via(id), {:get_sync_state})
	end

	def get_school_from_masked(id, masked_num) do
		GenServer.call(via(id), {:school_from_masked_num, masked_num})
	end

	def reload(id) do
		GenServer.call(via(id), {:reload})
	end

	def get_last_caller(id, school_id) do
		sync_state = Sarkar.Supplier.get_sync_state(id)

		history = Dynamic.get(sync_state, ["matches", school_id, "history"])
		# get the latest call_start or call_end event 
		{_, %{"user" => %{"number" => number}}} = history
			|> Enum.filter(fn {_, %{"event" => event}} -> event == "CALL_START" end)
			|> Enum.sort(fn( {t1 , _}, {t2, _} ) -> t1 > t2 end)
			|> Enum.at(-1)

		number
	end

	def call_event(event_type, id, caller_id, school_id, meta) do
		sync_state = Sarkar.Supplier.get_sync_state(id)

		time = :os.system_time(:millisecond)
		path = ["sync_state", "matches", school_id, "history", "#{time}"]

		value = case meta do
			nil -> %{
				"event" => event_type,
				"time" => time,
				"user" => %{
					"number" => caller_id,
					"name" => Dynamic.get(sync_state, ["numbers", caller_id, "name"])
				}
			}
			other -> 
				%{
					"event" => event_type,
					"time" => time,
					"user" => %{
						"number" => caller_id,
						"name" => Dynamic.get(sync_state, ["numbers", caller_id, "name"])
					},
					"meta" => meta
				}
		end

		changes = %{
			Enum.join(path, ",") => %{
				"action" => %{
					"path" => path,
					"type" => "MERGE",
					"value" => value
				},
				"date" => time
			}
		}

		GenServer.call(via(id), {:sync_changes, "elixir", changes, time})
	end

	# SERVER

	def handle_call({:school_from_masked_num, masked_num}, _from, {id, writes, sync_state} = state) do

		school_id = Dynamic.get(sync_state, ["mask_pairs", masked_num, "school_id"])
		{:reply, school_id, state}
	end

	def handle_call({:reload}, _from, {id, writes, sync_state} = state) do
		{ new_sync_state, new_writes } = Sarkar.Store.Supplier.load(id)

		{:reply, :ok, {id, new_sync_state, new_writes}}
	end

	def handle_call({:sync_changes, client_id, changes, last_sync_date}, _from, {id, writes, sync_state} = state) do

		# map of changes.
		# key is path separated by comma
		# value is { action: {path, value, type}, date}

		# make sure we aren't missing any writes between last sync_date and the least path_date.

		# This is happening way more than expected. It should only happen for very out of date clients - which should not be the case in 1 day and no GC
		min_write_date = if writes != %{} do

			{_, %{"date" => mwd }} = writes 
				|> Enum.min_by(fn {path_string, %{"date" => path_date}} -> path_date end)
			
			mwd
		end

		have_all_in_memory? = min_write_date < last_sync_date

		writes = if not have_all_in_memory? do
				case Sarkar.Store.Supplier.get_writes(id, last_sync_date) do
					{:ok, aug_writes} -> 
						# whats in aug_writes that isnt in writes??
						IO.puts "SUCCESSFUL DB RECOVERY @ #{:os.system_time(:millisecond)}. last_sync_date: #{last_sync_date} min_write_date: #{min_write_date}"
						aug_writes
					{:error, err} -> 
						IO.puts "ERROR ON DB RECOVERY"
						IO.inspect err
						writes
				end
		else
			writes
		end

		# end weird section

		# TODO: sort changes by time and process in order.

		{nextSyncState, nextWrites, new_writes, last_date} = changes
		|> Enum.sort(fn({ _, %{"date" => d1}}, {_, %{"date" => d2}}) -> d1 < d2 end)
		|> Enum.reduce(
			{sync_state, writes, %{}, 0}, 
			fn({path_key, payload}, {agg_sync_state, agg_writes, agg_new_writes, max_date}) -> 

				%{
					"action" => %{
						"path" => path,
						"type" => type,
						"value" => value
					},
					"date" => date
				} = payload

				[prefix | p ] = path

				p_key = Enum.join(p, ",")
				write = %{
					"date" => date,
					"value" => value,
					"path" => path,
					"type" => type,
					"client_id" => client_id
				}

				case type do
					"MERGE" ->
						case Map.get(agg_writes, p_key) do
							nil -> 
								{
									Dynamic.put(agg_sync_state, p, value),
									Map.put(agg_writes, p_key, write),
									Map.put(agg_new_writes, p_key, write),
									max(date, max_date)
								}
							%{"date" => prev_date, "value" => prev_value} when prev_date <= date ->
								{
									Dynamic.put(agg_sync_state, p, value),
									Map.put(agg_writes, p_key, write),
									Map.put(agg_new_writes, p_key, write),
									max(date, max_date)
								}
							%{"date" => prev_date, "value" => prev_value} when prev_date > date ->
								IO.puts "#{id}: #{prev_date} is more recent than #{date}. current time is #{:os.system_time(:millisecond)}"
								# IO.inspect write
								{
									agg_sync_state,
									agg_writes,
									agg_new_writes,
									max_date
								}
							other -> 
								IO.puts "OTHER!!!!!!!!!!!!!"
								IO.inspect other
								{
									Dynamic.put(agg_sync_state, p, value),
									Map.put(agg_writes, p_key, write),
									Map.put(agg_new_writes, p_key, write),
									max(date, max_date)
								}
						end

					"DELETE" -> 
						case Map.get(agg_writes, p_key) do
							nil -> 
								{
									Dynamic.delete(agg_sync_state, p),
									Map.put(agg_writes, p_key, write),
									Map.put(agg_new_writes, p_key, write),
									max(date, max_date)
								}
							%{"date" => prev_date} when prev_date <= date ->
								{
									Dynamic.delete(agg_sync_state, p),
									Map.put(agg_writes, p_key, write),
									Map.put(agg_new_writes, p_key, write),
									max(date, max_date)
								}
							%{"date" => prev_date} when prev_date > date ->
								{
									agg_sync_state,
									agg_writes,
									agg_new_writes,
									max_date
								}
							other ->
								IO.puts "OTHER!!!!!!!!!!!"
								IO.inspect other
								{
									Dynamic.delete(agg_sync_state, p),
									Map.put(agg_writes, p_key, write),
									Map.put(agg_new_writes, p_key, write),
									max(date, max_date)
								}
						end
					other -> 
						IO.puts "unrecognized type"
						{agg_sync_state, max_date}
				end
			end)

		# at this point we need to send the new snapshot to all clients that are up to date.

		# each client has sent its "last received data" date. 
		# when it connects, we should send all the latest writes that have happened since then, not the full db.
		# get that data for it here.

		relevant = nextWrites
					|> Enum.filter(fn {path_string, %{"date" => path_date, "client_id" => cid }} -> 

						old = path_date > last_sync_date and not Map.has_key?(new_writes, path_string) 
						new = old and cid != client_id

						if old and not new do
							IO.puts "this would have been sent before but not now"
							IO.inspect path_string
						end

						old and new
					end)
					|> Enum.into(%{})
		
		case map_size(new_writes) do
			# 0 -> {:reply, confirm_sync(last_date, nextDb), {school_id, nextWrites, nextDb}}
			0 -> {:reply, confirm_sync_diff(last_date, relevant), {id, nextWrites, nextSyncState}}
			_ -> 
				#broadcast(school_id, client_id, snapshot(nextDb))
				broadcast(id, client_id, snapshot_diff(new_writes))
				Sarkar.Store.Supplier.save(id, nextSyncState, new_writes)
				# what do we do about attendance?? there are so many paths...
				# {:reply, confirm_sync(last_date, nextDb), {school_id, nextWrites, nextDb}}
				{:reply, confirm_sync_diff(last_date, relevant), {id, nextWrites, nextSyncState}}
		end
	end

	def handle_call({:get_sync_state}, _from, {id, writes, sync_state} = state) do
		{:reply, sync_state, state}
	end

	def handle_call(a, b, c) do 
		IO.inspect a
		IO.inspect b
		IO.inspect c

		{:reply, "no match...", c}
	end

	# generates action
	defp snapshot(sync_state) do
		%{
			type: "SNAPSHOT",
			sync_state: sync_state
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

	defp confirm_sync(date, sync_state) do
		%{
			type: "CONFIRM_SYNC",
			date: date,
			sync_state: sync_state
		}
	end

	defp via(id) do
		{:via, Registry, {Sarkar.SupplierRegistry, id}}
	end

	defp broadcast(school_id, sender_id, message) do

		Registry.lookup(Sarkar.ConnectionRegistry, school_id)
		|> Enum.filter(fn {pid, client_id}-> client_id != sender_id end)
		|> Enum.map(fn {pid, _} -> send(pid, {:broadcast, message}) end)

	end
end