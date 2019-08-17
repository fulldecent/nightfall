FROM node:12.7

WORKDIR /app

COPY src src
COPY code code
COPY __tests__ __tests__
COPY response response
COPY zkp-utils zkp-utils
COPY ./package.json ./package-lock.json ./
RUN npm ci

VOLUME build
VOLUME config

EXPOSE 80
CMD npm start
