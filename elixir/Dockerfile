FROM elixir:1.7-alpine

RUN apk add --no-cache git
RUN apk add --no-cache alpine-sdk

RUN mix local.hex --force
RUN mix local.rebar

ENV MIX_ENV=prod

WORKDIR /app

ADD mix.exs .
ADD mix.lock .

RUN mix deps.clean --all
RUN mix deps.get
RUN mix deps.compile

ADD . .

EXPOSE 8080
CMD elixir --sname "sarkar" -S mix run --no-halt