const { Pool } = require('pg')



const pool = new Pool ({
    user : process.env.USER,
    password : process.env.PASSWORD,
    host : process.env.HOST,
    database : "postgresql-perpendicular-42125",
    ssl : process.env.ENV === 'PRODUCTION' ? {
            sslmode: 'require',
            rejectUnauthorized: false,
        } : false,
});

module.exports = pool;

