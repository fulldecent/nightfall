# Nightfall Zero-Knowledge Proof Service

*This module is part of Nightfall. Most users will only be interested in using the application as a whole, we direct those readers to [the main README](../../README.md). This file provides additional information on how this module works so you can learn about, tinker and develop it.*

This module is responsbile for generating cryptographic key pairs which, relying on the magic of zk-SNARKs, allow one party to perform a computation and another to confirm it while minimizing information flow from the former to the latter. Nightfall exploits this to allow transfer of tokens while hiding the origin, destination, and even identity(!) of these tokens.

## Tasks you can perform

### Generate key pairs

You will need key pairs to run the full application. And the `zkp-demo` script does indeed perform this step as part of the demonstration. Generating the key pairs uses randomness as an input, so every time you generate, the pairs will be different. **If you are attaching Nightfall to an existing deployment then you will import those keys and you will NOT want to generate your own key pairs** since yours would be incompatible with the deployed applicaition.

⚠️ This task will run approximately one to three hours depending on your machine.

:book: ​This task has a recipe in the Nightfall makefile, execute it using `make zkp-generate-keys` from the top-level folder. Following are instructions to perform this task manually.

From the `zkp` folder, simply run:

```sh 
docker build .
```



- Generate key pairs
- - Run `docker

### Development

Prerequesites for development of Nightfall are documented in [the main project README](../../README.md). Satisfy those first before proceeding.

Build

```sh
removed from package.json
    "esm": "^3.2.25",



cd application/zkp
# Copy in the required module
mkdir node_modules
cp -r ../zkp-utils node_modules

# REQUIRES NPM V6.10.1+
# Source https://github.com/ethereum/web3.js/issues/2863#issuecomment-514226742
npm update -g npm

npm install
```

Clean

```sh
rm -rf node_modules
```

