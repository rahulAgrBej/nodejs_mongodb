// ENV variables can also be run in default with nodenv package to be installed

console.log('No value for environment variable FOO yet: ', process.env.FOO);

// This below code is to only load the .env file if we are not in production mode
if (process.env.NODE_ENV !== 'production')
{
    require('dotenv').config()
}

console.log('Now environment variable for FOO exists: ', process.env.FOO);