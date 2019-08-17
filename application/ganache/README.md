# Ganache Docker Image

*This module is part of Nightfall. Most users will only be interested in using the application as a whole, we direct those readers to [the main README](../../README.md). This file provides additional information on how this module works so you can learn about, tinker and develop it.*

This Docker image is responsible for implementing a blockchain environment which is compatible with the Ethereum public network but which is separate, runs locally, and does not cost any money to operate.

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

## Development

No custom features are added in this Docker image, as it is referenced directly to [upstream](https://github.com/trufflesuite/ganache-cli). You may develop this image upstream to contribute to that project. To patch in a custom Ganache service against an otherwise off-the-shelf Nightfall application use this approach:

1. Run the updated Ganache service locally on port 8545.
2. Use the `docker-compose up` command with the `scale` option to avoid launching the dependent Ganache service.
3. Patch your localhost port 8545 into the Docker Compose network that contains the rest of the application.