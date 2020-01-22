defmodule Sarkar.Image.Worker do
	use GenServer

	def start_link(_) do
		GenServer.start_link(__MODULE__, nil, [])
	end

	def init(_) do
		{:ok, nil}
	end

	def handle_call({:upload_image, %{"id" => id, "image_string" => image_string, "path" => path} = merge}, _from, state) do
		
		IO.puts "uploading image in worker"

		url = Sarkar.Storage.Google.upload_image("mischool-upload-images", id, image_string)

		{:reply, url, state}
	end
end