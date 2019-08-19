#
# Nightfall makefile
# 
# For SYNOPSIS, just run:
#
#     make
#

DOCKER_COMPOSE_OPTS = --project-name nightfall

# From https://marmelab.com/blog/2016/02/29/auto-documented-makefile.html
help: ## Show available commands
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

truffle-compile: ## Compile all Solidity contracts
	docker-compose $(DOCKER_COMPOSE_OPTS) run --rm truffle-offchain compile --all
	docker-compose $(DOCKER_COMPOSE_OPTS) run --rm truffle-zkp compile --all

truffle-migrate: ## Deploy all Solidity contracts
	docker-compose $(DOCKER_COMPOSE_OPTS) run --rm truffle-offchain migrate --reset --network=default
	docker-compose $(DOCKER_COMPOSE_OPTS) run --rm truffle-zkp migrate --reset --network=default

offchain-test-migrate:
	docker-compose $(DOCKER_COMPOSE_OPTS) -f docker-compose.test.yml run --rm truffle-offchain_test migrate --reset --network=default
	docker-compose $(DOCKER_COMPOSE_OPTS) -f docker-compose.test.yml run --rm truffle-zkp_test migrate --reset --network=default

zkp-start: ## Stand up zkp service
	docker-compose $(DOCKER_COMPOSE_OPTS) run --rm zkp npm start

zkp-test: ## Run zkp tests
	docker-compose $(DOCKER_COMPOSE_OPTS) run --rm zkp npm test

local-build-dependencies: ## (On local machine, not Docker) install npm dependencies
	(cd zkp-utils && npm ci)
	(cd account-utils && npm ci)
	(cd zkp && npm ci)

local-clean-depednencies: ## (On local machine, not Docker) clean npm dependencies
	(cd zkp-utils && rm -rf node_modules)
	(cd account-utils && rm -rf node_modules)
	(zkp && rm -rf node_modules)

local-generate-keys: ## (On local machine, not Docker) run zkp key generation setup
	(cd zkp && npm run setup)

local-clean-keys: ## Delete key files
	@echo "The zkp keys take ~1 hour to setup. Deleting them is irreversible."
	@read -p "Continue? [y/n] " yn
	@case $yn in [Yy]* ) break;; [Nn]* ) exit;; * ) echo "Please answer y or n."; exit;; esac
	rm -rf ../local/zkp-keys