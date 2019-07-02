defmodule Sarkar.Slack do
	use Tesla

	def send_alert(%{"city" => city, "name" => name, "packageName" => packageName, "phone" => phone, "schoolName" => schoolName }) do

		url = "https://hooks.slack.com/services/" <> System.get_env("SLACK_TOKEN")
		data = Poison.encode!(%{"text" => "New Sign-Up\nSchool Name: #{schoolName},\nPhone: #{phone},\nPackage: #{packageName},\nName: #{name},\nCity: #{city}"})
		{:ok, _response } = Tesla.post(url, data)
	end

end