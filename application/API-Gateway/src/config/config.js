let env = 'local' //set the environment to local if not mentioned while starting the app
const props = {
    local: {
        HASHLENGTH: 8, //expected length of a hash in bytes
        accounts:{
            host: 'http://accounts',
            port: "80"
        },
        zkp: {
            host: 'http://zkp',
            port: "80"
        },
        database: {
            host: 'http://database',
            port: "80"
        },
        offchain: {
            host: 'http://offchain',
            port: "80"
        },
        enable_logger: true
    },
    test: {
        HASHLENGTH: 8, //expected length of a hash in bytes
        accounts:{
            host: 'http://accounts_test',
            port: "80"
        },
        zkp: {
            host: 'http://zkp_test',
            port: "80"
        },
        database: {
            host: 'http://database_test',
            port: "80"
        },
        offchain: {
            host: 'http://offchain_test',
            port: "80"
        },
        enable_logger: true
    },
}

/**
 * Set the environment
 * @param { string } environment - environment of app
 */
let setEnv = (environment) => {
    if(props[environment]){
        env = environment
    }
}
setEnv(process.env.NODE_ENV);

/**
 * get the appropriate environment config
 */
let getProps = () => {
    return props[env]
}

module.exports = {
    setEnv,
    getProps
}
