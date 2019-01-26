defmodule Sarkar.Store.School do
	use GenServer

	# this module exists to provide sync/restore capabilities for clients
	# this is not for data-sharing

	def init(args) do
		{:ok, args}
	end

	def start_link(_opts) do
		GenServer.start_link(__MODULE__, {}, name: :school_db)
	end

	def save(school_id, db) do
		GenServer.cast(:school_db, {:save, school_id, db})
	end

	def save(school_id, db, writes) do
		GenServer.cast(:school_db, {:save, school_id, db})
		GenServer.cast(:school_db, {:save_writes, school_id, writes})
	end

	def load(school_id) do
		GenServer.call(:school_db, {:load, school_id})
	end

	def get_school_ids() do
		GenServer.call(:school_db, {:get_school_ids})
	end

	def get_writes(school_id, last_sync_date) do
		GenServer.call(:school_db, {:get_writes, school_id, last_sync_date})
	end

	# modify this to return db + (last 50) writes writes map of path, value, data, type
	def handle_call({:load, school_id}, _from, state) do
		case Postgrex.query(
			Sarkar.School.DB,
			"SELECT db from backup where school_id=$1", [school_id]) do
				{:ok, %Postgrex.Result{num_rows: 0}} -> {:reply, {%{}, %{}}, state}
				{:ok, resp} ->
					[[db]] = resp.rows

					case Postgrex.query(Sarkar.School.DB, "SELECT path, value, time, type FROM writes WHERE school_id=$1 ORDER BY time desc limit $2", [school_id, 50]) do
						{:ok, writes_resp} ->
							write_formatted = writes_resp.rows
								|> Enum.map(fn([ [_ | p] = path, value, time, type]) -> {Enum.join(p, ","), %{
									"path" => path, "value" => value, "date" => time, "type" => type
								}} end)
								|> Enum.reverse
								|> Enum.into(%{})

							{:reply, {db, write_formatted}, state}
						{:error, err} -> {:reply, {:error, err}, state} 
					end
				{:error, err} ->
					IO.inspect err
					{:reply, {:error, err}, state}
		end
	end

	def handle_call({:get_writes, school_id, last_sync_date}, _from, state) do
		case Postgrex.query(
			Sarkar.School.DB,
			"SELECT path, value, time, type FROM writes where school_id=$1 AND time > $2 ORDER BY time desc", [school_id, last_sync_date]) do
				{:ok, writes_resp} ->
					write_formatted = writes_resp.rows
						|> Enum.map(fn([ [_ | p] = path, value, time, type]) -> {Enum.join(p, ","), %{
							"path" => path, "value" => value, "date" => time, "type" => type
						}} end)
						|> Enum.reverse
						|> Enum.into(%{})
					
					{:reply, {:ok, write_formatted}, state}

				{:error, err} -> {:reply, {:error, err}, state}
			end
	end

	def handle_call({:get_school_ids}, _from, state) do
		case Postgrex.query(
			Sarkar.School.DB,
			"SELECT school_id from backup", []) do
				{:ok, resp} -> 
					schools = Enum.map(resp.rows, fn([ school ]) -> school end)
					{:reply, {:ok, schools}, state}
				{:error, err} -> {:reply, {:error, err}, state}
		end
	end

	def handle_cast({:save, school_id, db}, state) when db == %{} do
		# ignore empty db save
		{:noreply, state}
	end

	def handle_cast({:save, school_id, db}, state) do

		case Postgrex.query(
			Sarkar.School.DB,
			"INSERT INTO backup (school_id, db) VALUES ($1, $2) ON CONFLICT (school_id) DO UPDATE SET db=$2", [school_id, db]) do
			{:ok, resp} -> {:noreply, state}
			{:error, err} -> 
				IO.puts "write failed"
				IO.inspect err 
				{:noreply, state}
		end
	end

	def handle_cast({:save_writes, school_id, writes}, state) do

		gen_value_strings = Stream.with_index(Map.values(writes), 1)
			|> Enum.map(fn {w, i} -> 
				x = (i - 1) * 5 + 1
				"($#{x}, $#{x + 1}, $#{x + 2}, $#{x + 3}, $#{x + 4})" end)

		flattened_writes = Map.values(writes)
			|> Enum.map(fn %{"date" => date, "value" => value, "path" => path, "type" => type} -> [school_id, path, value, date, type] end)
			|> Enum.reduce([], fn curr, agg -> Enum.concat(agg, curr) end)

		case Postgrex.query(
			Sarkar.School.DB,
			"INSERT INTO writes (school_id, path, value, time, type) VALUES #{Enum.join(gen_value_strings, ",")}", flattened_writes) do
				{:ok, resp} -> {:noreply, state}
				{:error, err} -> 
					IO.puts "write failed"
					IO.inspect err
					{:noreply, state}
			end
	end
end