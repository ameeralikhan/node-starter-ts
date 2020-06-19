require('ts-node/register');

const config = require('../src/config/index.ts').default;

module.exports = {
    development: {
        host: 'localhost',
        port: 5432,
        username: 'postgres',
        password: 'postgres',
        database: 'nodeStarterDB',
        dialect: 'postgres',
        dialectOptions: {
            ssl: false
        },
        operatorsAliases: false
    },
    live: {
        host: 'localhost',
        port: 5432,
        username: 'postgres',
        password: 'postgres',
        database: 'nodeStarterDB',
        dialect: 'postgres',
        dialectOptions: {
            ssl: false
        },
        operatorsAliases: false
    }
};