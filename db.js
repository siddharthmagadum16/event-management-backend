const { Pool } = require('pg')



const pool = new Pool ({
    user : process.env.USER,
    password : process.env.PASSWORD,
    host : process.env.HOST,
    database : "event_management_system",
    ssl : process.env.ENV === 'PRODUCTION' ? true : false,
});

module.exports = pool;

