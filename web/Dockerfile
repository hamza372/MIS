FROM node:8.14.0

RUN npm install --global serve

WORKDIR /app
ADD package.json package.json
RUN npm install

ADD . .
RUN npm run build
RUN rm -rf node_modules

CMD serve -s ./build
