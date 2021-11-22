const express = require('express')
const auth = express.Router()
const pool = require("../startup/db");
const clgmsg = require('../startup/logger')

async function isValidMaganerorCustomer(username, password,table_name,user_id) {

    const command = `SELECT ${user_id}, password FROM ${table_name} WHERE ${user_id}=$1 AND password=$2`;
    const details = [username, password];

    return await pool.query(command,details)
    .then(res =>{
        return res.rows.length === 1 ? 1  : 0;
    })
    .catch(err => {
        setImmediate(() => {
            clgmsg('err',err);
            throw err;
        })
    })

}

auth.post("/login", async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    clgmsg(username, password); // need to remove logging
    try {
        const validManager = await isValidMaganerorCustomer(username, password,'Event_Manager','m_id',);
        const validCustomer = await isValidMaganerorCustomer(username, password,'Customer','cust_id',);
        if (validManager === 1 || validCustomer === 1) {
            return res.status(200).send("1");
        } else {
            return res.status(404).send("0");
        }
    } catch (err) {
        clgmsg("error occurred: ", err);
        res.send("0");
        return;
    } finally {

    }
});

module.exports = auth