require('ts-node/register');

const config = require('../src/config/index.ts').default;

module.exports = {
    development: {
        host: 'localhost',
        port: 5432,
        username: 'postgres',
        password: 'postgres',
        database: 'aetasaal',
        dialect: 'postgres',
        dialectOptions: {
            ssl: false
        },
        operatorsAliases: false
    },
    live: {
        host: 'ec2-54-235-208-103.compute-1.amazonaws.com',
        port: 5432,
        username: 'hmszolrlciatrx',
        password: '7992419508a7ff36765bf7addc0e07fdb11b90b85b68372f024bfd9fa87b5a61',
        database: 'dfps9d3tkcn7ua',
        dialect: 'postgres',
        dialectOptions: {
            ssl: true
        },
        operatorsAliases: false
    }
};