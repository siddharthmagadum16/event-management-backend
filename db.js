const { Pool } = require('pg')



const pool = new Pool ({
    user : process.env.USER,
    password : process.env.PASSWORD,
    host : process.env.HOST,
    database : process.env.DATABASE,
    ssl : false,
});
console.log(`pool : ${pool}`)

module.exports = pool;

