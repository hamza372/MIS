defmodule Sarkar.Store.School do
	use GenServer

	# this module exists to provide sync/restore capabilities for clients
	# this is not for data-sharing

	def start_link() do
		GenServer.start_link(__MODULE__, {}, name: :school_db)
	end

	def save(school_id, db) do
		GenServer.cast(:school_db, {school_id, db})
	end

	def handle_cast({school_id, db}, _state) do

		case Postgrex.query(Sarkar.School.DB, "INSERT INTO backup (school_id, jsondb) VALUES ($1, $2) ON CONFLICT DO UPDATE")

		{:noreply, }
	end




end