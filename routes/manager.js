const express = require('express');
const manager = express.Router();
const pool = require('../startup/db')
const clgmsg = require('../startup/logger')


manager.get('/manager-view/:manager_id', async (req,res) =>{

    const manager_id = req.params.manager_id;
    clgmsg('manager_id',manager_id)
    const command = `SELECT * FROM event NATURAL JOIN event_manager NATURAL JOIN caterer NATURAL JOIN decorator NATURAL JOIN venue_manager WHERE m_id=$1`
    const details = [manager_id]

    return await pool
    .query(command, details)
    .then(result =>{
        return res.send(result.rows);
    })
    .catch(err => {
        res.send("0");
        clgmsg('err: ', err)
    });

})


module.exports = manager ;