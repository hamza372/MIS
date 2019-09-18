defmodule Mix.Tasks.Flattened do
	use Mix.Task

	def run(["migrate"]) do
		# query each db out of backup
		# flatten.... all the way out...

		Application.ensure_all_started(:sarkar)

		{:ok, res} = Postgrex.query(Sarkar.School.DB, "SELECT school_id from backup", [])

		schools = res.rows 
			|> Enum.map(fn [sid] -> sid end)
			|> Enum.each(fn sid -> 
				migrate_to_flattened_db(sid)
			end)

	end

	def migrate_to_flattened_schools(school_id) do

		{:ok, res} = Postgrex.query(Sarkar.School.DB, "SELECT path, value, time from writes where school_id=$1 order by time asc", [school_id])

		res.rows 
		|> Enum.each(fn [path, value, time] -> 
			# for each write there will be several flattened writes 


		end)


	end

end