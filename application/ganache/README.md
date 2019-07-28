# Ganache Docker Image

*This module is part of Nightfall. Most users will only be interested in using the application as a whole, we direct those readers to [the main README](../README.md). This file provides additional information on how this module works so you can learn about, tinker and develop it.*

This module is responsible for implementing a blockchain environment which is compatible with the Ethereum public network but which is separate, runs locally, and does not cost any money to operate.

:information_source: This README file documents the `ganache` service in the application [ `docker-compose.yml` file](../docker-compose.yml), otherwise, this folder does not have any additional files.

## Tasks you can perform

### Ethereum JSON-RPC calls

The [Ethereum JSON-RPC API](https://github.com/ethereum/wiki/wiki/JSON-RPC) in an interface where a blockchain application may interact with a network node.

Use this command to start the service:

```sh
DOCKER_COMPOSE_FILE=application/docker-compose.yml
docker-compose --file $DOCKER_COMPOSE_FILE run --publish "8545:8545" ganache
```

In a separate terminal session, test the service with this command:

```sh
curl -X POST --data '{"jsonrpc":"2.0","method":"web3_clientVersion","params":[],"id":67}' localhost:8545
```

Then kill the service by typing <kbd>CTRL</kbd>-<kbd>C </kbd> in the original terminal session.