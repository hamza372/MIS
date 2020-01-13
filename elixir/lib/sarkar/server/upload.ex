defmodule Sarkar.Server.Upload do
	
	def init(%{method: "OPTIONS"} = req, state) do

		res = :cowboy_req.reply(200, headers(), "{}", req)

		{:ok, res, state}
	end

	def init(%{bindings: %{type: "image"}} = req, state) do

		# in this request, we should get client_id, and an image in the post body
		# we can then process it
		# 

		IO.puts "got image request"

		%{
			"client-id" => client_id,
			"token" => token, 
			"school-id" => school_id, 
			"client-type" => client_type
		} = :cowboy_req.headers(req)

		length = :cowboy_req.body_length(req)
		IO.inspect length
		{:ok, data, req1} = :cowboy_req.read_body(req)

		parsed = Poison.decode!(data)
		IO.inspect parsed
		%{"payload" => %{"image_merge" => image_merge}, "lastSnapshot" => last_sync_date} = parsed
		

		upload_res = Sarkar.School.upload_images(school_id, client_id, [image_merge], last_sync_date)
		IO.inspect upload_res
		

		# should send back something to let it know that this is processing
		res = :cowboy_req.reply(200, headers(), "{}", req)

		{:ok, res, state}
	end

	defp headers() do
		%{
			"content-type" => "application/json",
			"cache-control" => "no-cache",
			"access-control-allow-methods" => "GET, POST, OPTIONS",
			"access-control-allow-origin" => "*",
			"access-control-allow-headers" => "*"
		}
	end
end