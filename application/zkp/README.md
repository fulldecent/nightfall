# Nightfall ZKP Service


# Run tests

make zkp-tests

# Run service without using Docker Compose

Set up ganache, set up dependency, somehow...

Go to application folder

```sh
docker build -q zkp
docker run --rm -it $(docker build -q zkp) \
  --volume ./zkp/src:/app/src \
  --volume ./zkp/response:/app/response \
  --volume ./zkp/build:/app/build \
  --volume ./zkp/code:/app/code \
  --volume ./zkp/.babelrc:/app/.babelrc \
  --volume ./zkp-utils:/app/node_modules/zkp-utils \
  --volume ./account-utils:/app/src/account-utils \
  --volume ./zkp/__tests__:/app/__tests__ \
  --volume ./config:/app/config \
  --volume /var/run/docker.sock:/var/run/docker.sock \
  --env VIRTUAL_HOST=zkp.nightfall.docker\
  --env NODE_ENV=docker
```
