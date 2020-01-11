defmodule Sarkar.Storage.Google do
	def upload_image(bucket_id, imageId, dataString) do

		"data:image/png;base64," <> raw = dataString

		file_path = "#{imageId}.png"

		File.write!(file_path, Base.decode64!(raw))

		{:ok, token} = Goth.Token.for_scope("https://www.googleapis.com/auth/cloud-platform")
		conn = GoogleApi.Storage.V1.Connection.new(token.token)

		{:ok, object} = GoogleApi.Storage.V1.Api.Objects.storage_objects_insert_simple(
			conn,
			bucket_id,
			"multipart",
			%{name: Path.basename(file_path)},
			file_path
		)

		File.rm!(file_path)

		object.mediaLink

	end

	def upload_image_from_url(bucket_id, img_url) do

		base = "https://storage.cloud.google.com/"
		case String.contains?(img_url, bucket_id) do
			true ->
				case String.starts_with?(img_url, base <> bucket_id) do
					true ->
						# now we have to correct these urls...
						# turn https://storage.cloud.google.com/ilmx-product-images/fatima%20the%20spinner.JPG?authuser=3
						# into https://storage.googleapis.com/ilmx-product-images/fatima%20the%20spinner.JPG

						"https://storage.cloud.google.com/" <> rest = img_url

						[bucket_and_id | _junk]  = String.split(rest, "?")

						[_bucket_id, id] = String.split(bucket_and_id, "/")

						new_url = "https://storage.googleapis.com/" <> bucket_id <> "/" <> id

						new_url

					false -> img_url
				end
			false ->
				IO.puts "uploading img_url #{img_url}"
				%HTTPoison.Response{body: body} = HTTPoison.get!(img_url)

				file_path = img_url
					|> String.split("/")
					|> List.last()

				File.write!(file_path, body)

				{:ok, token} = Goth.Token.for_scope("https://www.googleapis.com/auth/cloud-platform")
				conn = GoogleApi.Storage.V1.Connection.new(token.token)

				{:ok, object} = GoogleApi.Storage.V1.Api.Objects.storage_objects_insert_simple(
					conn,
					bucket_id,
					"multipart",
					%{name: Path.basename(file_path)},
					file_path
				)

				File.rm!(file_path)

				object.mediaLink

		end

	end

end
