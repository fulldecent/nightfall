FROM node:11.15

RUN mkdir /app
WORKDIR /app

COPY src src
COPY code code
COPY .babelrc .babelrc
COPY __tests__ __tests__
COPY response response
COPY zkp-utils zkp-utils
COPY ./package.json ./package-lock.json ./
RUN npm ci

VOLUME build
VOLUME config

EXPOSE 80
CMD npm start
