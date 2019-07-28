##
## This makefile defines all use cases for the Nightfall project
##

DOCKER_COMPOSE_FILE=application/docker-compose.yml
APPLICATON_NAME=nightfall

NO_COLOR=\x1b[0m
OK_COLOR=\x1b[32;01m
ERROR_COLOR=\x1b[31;01m
WARN_COLOR=\x1b[33;01m

OK_STRING=$(OK_COLOR)[OK]$(NO_COLOR)
ERROR_STRING=$(ERROR_COLOR)[ERRORS]$(NO_COLOR)
WARN_STRING=$(WARN_COLOR)[WARNINGS]$(NO_COLOR)

truffle-compile:
	docker-compose run --rm truffle-offchain compile --all
	docker-compose run --rm truffle-zkp compile --all

truffle-migrate:
	docker-compose --file $(DOCKER_COMPOSE_FILE) run --rm truffle-offchain migrate --reset --network=default
	docker-compose --file $(DOCKER_COMPOSE_FILE) run --rm truffle-zkp migrate --reset --network=default

# offchain-test:
	# docker-compose run --rm offchain npm t
	# docker-compose run --rm truffle-offchain test --network=default

zkp-start:
	docker-compose run --rm zkp npm start

zkp-test:
	docker-compose run --rm zkp npm t

demo:
	@echo Stopping any running Nightfall application
	-docker-compose --file $(DOCKER_COMPOSE_FILE) down --volumes
	@echo "$(OK_STRING)"

# printf "${GREEN}*** Pull zokrates docker image ***${NC}\n"
# docker pull michaelconnor/zok:2Jan2019

	@echo
	@echo Launching containerized ganache
	docker-compose --file $(DOCKER_COMPOSE_FILE) up --detach ganache
	@echo "$(OK_STRING)"

	@echo
	@echo Deploying all contracts
	make truffle-migrate
	@echo "$(OK_STRING)"

	@echo
	@echo Launching containerized microservices
	docker-compose --file $(DOCKER_COMPOSE_FILE) up --detach
	@echo "$(OK_STRING)"

	@echo
	@echo Tailing logs
	docker-compose --file $(DOCKER_COMPOSE_FILE) logs -f
	@echo "$(OK_STRING)"




#install.sh
#!/usr/bin/env bash
# Exit script as soon as a command fails.
# set -o errexit

# cd zkp-utils && rm -rf node_modules && npm ci && \
# cd ../zkp && rm -rf node_modules && npm ci && \
# npm run setup-all && cd ../
