/**
 * Module constants switcher
 *
 * @desc runtime constants which can be selected using NODE_ENV
 *
 * To choose the constants at runtime, set the environment variable NODE_ENV.
 * We have a few abstractions for ease of development, packaging and
 * orchestration. So the equivalent commands to run this module are:
 *
 *     babel-node ./src/index.js
 *     nodemon --exec babel-node ./src/index.js
 *     npm start
 *     docker run ...
 *     docker-compose up [...]
 *
 * In Docker Compose you will set the environment variable like so:
 *
 * services:
 *   ...
 *     environment:
 *       NODE_ENV: test
 */

let env = 'local'; // Default environment, if not specified in NODE_ENV

const commonConfig = {
  HASHLENGTH: 8, // expected length of a hash in bytes
  accounts: {
    host: process.env.ACCOUNTS_HOST,
    port: process.env.ACCOUNTS_PORT,
  },
  zkp: {
    host: process.env.ZKP_HOST,
    port: process.env.ZKP_PORT,
  },
  database: {
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
  },
  offchain: {
    host: process.env.OFFCHAIN_HOST,
    port: process.env.OFFCHAIN_PORT,
  },
  isLoggerEnable: true,
}

const props = {
  local: {
    ...commonConfig,
  },
  test: {
    ...commonConfig,
  },
};

/**
 * Set the environment
 * @param { string } environment - environment of app
 */
export function setEnv(environment) {
  if (props[environment]) {
    env = environment;
  }
}
setEnv(process.env.NODE_ENV);

/**
 * Get the active environment configuration
 */ 
export const getProps = () => props[env];
