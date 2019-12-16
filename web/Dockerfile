FROM node:8.14.0

RUN npm install --global serve

WORKDIR /app
ADD package.json package.json
ADD package-lock.json package-lock.json
RUN npm install

ADD . .
RUN npm run build
RUN rm -rf node_modules
ARG VERSION
ENV SHA_VERSION=$VERSION

CMD ./set_config.sh > build/config.js && serve ./build
