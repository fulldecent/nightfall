# Nightfall Zero-Knowledge Proof Utilities Node Package

*This module is part of Nightfall. Most users will only be interested in using the application as a whole, we direct those readers to [the main README](../../README.md). This file provides additional information on how this module works so you can learn about, tinker and develop it.*

This Node package provides math functions and formatting functions which are reusable across other other modules here that deal with smart contracts.

## Tasks you can perform

### Include this package into another Node project

This Node package is not pubished in a package registry. You would include it into another Node project by adding the `zip-utils` folder to that project's `node-modules` folder. Then update that other project's `package.json` to add a dependency

```
"dependencies": {
  ...
  "zkp-utils": "file:node_modules/zkp-utils"
},
```

### Run units tests

:warning: Currently no tests exist for you to perform against this module. Please contribute a pull request if you are able to provide this.

When tests exist you will run them using `npm install-test`.

## Development

Prerequesites for development of Nightfall are documented in [the main project README](../../README.md). Satisfy those first before proceeding.

Next install the package with the following commands:

```sh
cd application/zkp-utils
npm ci
```

Now you are ready to run any tests or connect to other Nightfall modules.

You can clean the build just like any other Node package:

```sh
cd application/zkp-utils
rm -rf node_modules
```

