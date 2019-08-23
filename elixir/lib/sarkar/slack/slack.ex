defmodule Sarkar.Slack do
	use Tesla

	def send_alert(alert_message) do

		url = "https://hooks.slack.com/services/" <> System.get_env("SLACK_TOKEN")

		{:ok, _response } = Tesla.post(url, alert_message)
	end

end