# MIS Web

## Setup
- Install docker
- Install elixir
- Install ngrok

First run the database using docker.

`docker run --name sarkar-db -e POSTGRES_PASSWORD=[password] -v /docker/sarkar/db:/var/lib/postgresql/data -p 5432:5432 --restart=always -d postgres:10.5`

After running this once, you shouldn't need to run this again. 

Next, clone this repository. After it's been cloned, go to the elixir folder. If it's the first time, run `mix deps.get` and `mix deps.compile`. After those commands have completed, you can run `iex -S  mix` to run the backend pointing at your local postgres container.

Now you're ready to run the webpage locally. Go to the `/web` folder, CERP/MIS/commits?authorand run `npm install` to get all the dependencies. Run `export HTTPS=true` and then run `npm start`. 

To connect your webpage to the backend, run `ngrok http 8080` in another command prompt. Use the forwarding number given by ngrok, and replace the number in the `debug_host` variable in `web/src/index.js` and hit save. Now everything is wired up.

