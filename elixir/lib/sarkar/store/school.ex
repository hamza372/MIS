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

	def load(school_id) do
		GenServer.call(:school_db, {:load, school_id})
	end

	def handle_call({:load, school_id}, _from, state) do
		case Postgrex.query(
			Sarkar.School.DB,
			"SELECT db from backup where school_id=$1", [school_id]) do
				{:ok, %Postgrex.Result{num_rows: 0}} -> {:reply, %{}, state}
				{:ok, resp} ->
					[[db]] = resp.rows
					{:reply, db, state}
				{:error, err} ->
					IO.inspect err
					{:reply, {:error, err}, state}
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
			{:ok, resp} -> 
				IO.puts "write succesful"
				{:noreply, state}
			{:error, err} -> 
				IO.puts "write failed"
				IO.inspect err 
				{:noreply, state}
		end
	end
end