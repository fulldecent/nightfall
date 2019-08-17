FROM node:10

WORKDIR /app

COPY ./package.json ./package-lock.json ./
COPY zkp-utils zkp-utils
RUN npm ci
RUN (cd node_modules/zkp-utils/ && npm ci)

COPY src src
COPY code code
COPY contracts contracts
COPY migrations migrations
COPY response response
COPY __tests__ __tests__
COPY test test
COPY .babelrc .babelrc

VOLUME build
VOLUME config

EXPOSE 80
CMD npm start
