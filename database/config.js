require('ts-node/register');

const config = require('../src/config/index.ts').default;

module.exports = {
    development: {
        host: 'ec2-174-129-25-182.compute-1.amazonaws.com',
        port: 5432,
        username: 'gesuwubgqepidn',
        password: '7cdce70c200110d914c826f525d23930bd3fd2a685a8d45dbd9331e21ee27af1',
        database: 'd6p31d2vd650cp',
        dialect: 'postgres',
        dialectOptions: {
            ssl: true
        },
        operatorsAliases: false
    }
};