/**
 * Module constants switcher
 *
 * @module config.js
 * @author Liju Jose
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

const props = {
  local: {
    mongo: {
      host: 'mongo',
      port: '27017',
      databaseName: 'nightfall',
      admin: 'admin',
      adminPassword: 'admin',
    },
    isLoggerEnable: true,
  },
  test: {
    mongo: {
      host: 'mongo_test',
      port: '27017',
      databaseName: 'nightfall_test',
      admin: 'admin',
      adminPassword: 'admin',
    },
    isLoggerEnable: true,
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
