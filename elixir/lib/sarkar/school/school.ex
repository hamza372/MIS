defmodule Sarkar.School do
	use GenServer

	@timeout :infinity

	def init({school_id}) do

		IO.puts "loading school #{school_id}..."
		{db, writes} = Sarkar.Store.School.load(school_id)
		IO.puts "loaded #{school_id}"

		{:ok, {school_id, writes, db}, @timeout}
	end

	def terminate(reason, state) do
		# no cleanup to do... just want to remove from memory
	end

	def start_link({school_id}) do
		IO.puts "initting school #{school_id}"
		GenServer.start_link(
			__MODULE__,
			{school_id},
			name: via(school_id)
		)
	end

	def init_trial (school_id) do
		curr_time = :os.system_time(:millisecond)

		sync_changes(school_id, "backend", %{
			"db,package_info" => %{
				"date" => curr_time,
				"action" => %{
					"path" => ["db","package_info"],
					"type" => "MERGE",
					"value" => %{
						"paid" => false,
						"trial_period" => 15,
						"date" => curr_time
					}
				}
			}
		},curr_time)
	end

	# API 

	def prepare_changes(changes) do
		# takes array of changes which are 
		# %{ type: "MERGE" | "DELETE", path: [], value: any }
		# and generates the map needed for sync_changes
	
		changes 
		|> Enum.map(fn %{"type" => type, "path" => path, "value" => value} -> {
			Enum.join(path, ","), %{
				"action" => %{
					"path" => path,
					"type" => type,
					"value" => value
				},
				"date" => :os.system_time(:millisecond)
			}
		} end)
		|> Enum.into(%{})
	end

	def sync_changes(school_id, client_id, changes, last_sync_date) do
		GenServer.call(via(school_id), {:sync_changes, client_id, changes, last_sync_date}, 30000)
	end

	def get_db(school_id) do
		GenServer.call(via(school_id), {:get_db})
	end

	def upload_images(school_id, client_id, image_merges, last_sync_date) do
		# here, a school could have been offline the entire time and is sending hundreds of images
		# we ask the images pool to upload the images. as each image completes, we want to issue the sync
		# and also fire the event back to the original client telling them that the image is finished processing

		# step one, image worker

		image_merges
		|> Enum.map(fn merge ->
			Task.async(fn -> 
				:poolboy.transaction(
					:image_worker,
					fn pid -> 
						url = GenServer.call(pid, {:upload_image, merge}) 
						{merge, url}
					end
				)
			end)
		end)
		|> Enum.each(fn task ->

			{merge, url} = Task.await(task)
			# then we call sync_changes using the info in the merge + url
			%{"id" => id, "path" => path} = merge

			value = %{
				"id" => id,
				"url" => url
			}

			prepared = prepare_changes([%{
				"type" => "MERGE",
				"path" => path,
				"value" => value
			}])

			# broadcasts the update to all other clients - but we wont send the result back direct to the client here
			reply = sync_changes(school_id, client_id, prepared, last_sync_date)

			# this action lets the client know that the image has been uploaded, and gives
			# enough info for the client to take it out of the queue, and update its state with the new value (now, not an image string)

			Registry.lookup(Sarkar.ConnectionRegistry, school_id)
			|> Enum.filter(fn {pid, cid}-> cid == client_id end)
			|> Enum.map(fn {pid, _} -> send(pid, {:broadcast, %{
				"type" => "IMAGE_UPLOAD_CONFIRM",
				"id" => id,
				"path" => path,
				"value" => value
			}}) end)

		end)

end

	def broadcast_all_schools() do
		{:ok, school_ids} = Sarkar.Store.School.get_school_ids()

		school_ids
		|> Enum.map(fn(school_id) -> broadcast_snapshot(school_id) end)

	end

	def broadcast_snapshot(school_id) do
		# but what if a client is not online when we trigger this
		# it should queue up and take place next time they come online...
		# then we need to keep a map of client and if they got this last update
		# if client_id existed previously, and hasn't been put on the "got update" map
		# then it should get the new update

		db = GenServer.call(via(school_id), {:reload_db})
		broadcast(school_id, "blank", snapshot(db)) # this should be the snapshot action.
	end

	def reload_all() do
		{:ok, school_ids} = Sarkar.Store.School.get_school_ids()

		# check if the school is loaded first...
		school_ids
		|> Enum.map(fn(school_id) ->  GenServer.call(via(school_id), {:reload_db}) end)
	end

	# SERVER

	def handle_info(:timeout, {school_id, db, writes} = state) do
		IO.puts "terminating #{school_id}"

		{:stop, :normal, state}
	end

	def handle_call({:reload_db}, _from, {school_id, writes, db} = state) do
		{new_db, new_writes} = Sarkar.Store.School.load(school_id)

		{:reply, new_db, {school_id, new_writes, new_db}, @timeout}
	end

	def handle_call({:sync_changes, client_id, changes, last_sync_date}, _from, {school_id, writes, db} = state) do

		# map of changes.
		# key is path separated by comma
		# value is { action: {path, value}, date}

		# make sure we aren't missing any writes between last sync_date and the least path_date.

		# This is happening way more than expected. It should only happen for very out of date clients - which should not be the case in 1 day and no GC
		min_write_date = if writes != %{} do

			{_, %{"date" => mwd }} = writes 
				|> Enum.min_by(fn {path_string, %{"date" => path_date}} -> path_date end)
			
			mwd
		end

		have_all_in_memory? = min_write_date < last_sync_date

		writes = if not have_all_in_memory? do
				case Sarkar.Store.School.get_writes(school_id, last_sync_date) do
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

		{nextDb, nextWrites, new_writes, last_date} = changes
		|> Enum.sort(fn({ _, %{"date" => d1}}, {_, %{"date" => d2}}) -> d1 < d2 end)
		|> Enum.reduce(
			{db, writes, %{}, 0}, 
			fn({path_key, payload}, {agg_db, agg_writes, agg_new_writes, max_date}) -> 

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
									Dynamic.put(agg_db, p, value),
									Map.put(agg_writes, p_key, write),
									Map.put(agg_new_writes, p_key, write),
									max(date, max_date)
								}
							%{"date" => prev_date, "value" => prev_value} when prev_date < date ->
								{
									Dynamic.put(agg_db, p, value),
									Map.put(agg_writes, p_key, write),
									Map.put(agg_new_writes, p_key, write),
									max(date, max_date)
								}
							%{"date" => prev_date, "value" => prev_value} when prev_date >= date ->
								# IO.puts "#{school_id}: #{prev_date} is more recent than #{date}. current time is #{:os.system_time(:millisecond)}"
								# IO.inspect write
								{
									agg_db,
									agg_writes,
									agg_new_writes,
									max(date, max_date)
								}
							other -> 
								IO.puts "OTHER!!!!!!!!!!!!!"
								IO.inspect other
								{
									Dynamic.put(agg_db, p, value),
									Map.put(agg_writes, p_key, write),
									Map.put(agg_new_writes, p_key, write),
									max(date, max_date)
								}
						end

					"DELETE" -> 
						case Map.get(agg_writes, p_key) do
							nil -> 
								{
									Dynamic.delete(agg_db, p),
									Map.put(agg_writes, p_key, write),
									Map.put(agg_new_writes, p_key, write),
									max(date, max_date)
								}
							%{"date" => prev_date} when prev_date < date ->
								{
									Dynamic.delete(agg_db, p),
									Map.put(agg_writes, p_key, write),
									Map.put(agg_new_writes, p_key, write),
									max(date, max_date)
								}
							%{"date" => prev_date} when prev_date >= date ->
								{
									agg_db,
									agg_writes,
									agg_new_writes,
									max(date, max_date)
								}
							other ->
								IO.puts "OTHER!!!!!!!!!!!"
								IO.inspect other
								{
									Dynamic.delete(agg_db, p),
									Map.put(agg_writes, p_key, write),
									Map.put(agg_new_writes, p_key, write),
									max(date, max_date)
								}
						end
					other -> 
						IO.puts "unrecognized type"
						{agg_db, max_date}
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

						# if old and not new do
						# 	IO.puts "this would have been sent before but not now"
						# 	IO.inspect path_string
						# end

						old and new
					end)
					|> Enum.into(%{})
		
		case map_size(new_writes) do
			# 0 -> {:reply, confirm_sync(last_date, nextDb), {school_id, nextWrites, nextDb}}
			0 -> {:reply, confirm_sync_diff(last_date, relevant), {school_id, nextWrites, nextDb}, @timeout}
			_ -> 
				#broadcast(school_id, client_id, snapshot(nextDb))
				broadcast(school_id, client_id, snapshot_diff(new_writes))
				Sarkar.Store.School.save(school_id, new_writes)
				# what do we do about attendance?? there are so many paths...
				# {:reply, confirm_sync(last_date, nextDb), {school_id, nextWrites, nextDb}}
				{:reply, confirm_sync_diff(last_date, relevant), {school_id, nextWrites, nextDb}, @timeout}
		end
	end

	def handle_call({:get_db}, _from, {school_id, writes, db} = state) do
		{:reply, db, state, @timeout}
	end

	def handle_call(a, b, c) do 
		IO.inspect a
		IO.inspect b
		IO.inspect c

		{:reply, "no match...", c, @timeout}
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
