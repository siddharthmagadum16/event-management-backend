const express = require('express');
const event = express.Router();
const pool = require('../startup/db')
const clgmsg = require('../startup/logger')

async function deleteViews(){
    return await pool.query('DROP VIEW IF EXISTS cust_event CASCADE')
    .then(res=> true)
    .catch(err => {
        console.log(err)
        return false;
    })
}

async function getOverallDetails(customer_id) {

    const command1 = `CREATE VIEW cust_event AS SELECT * FROM  EVENT NATURAL INNER JOIN CUSTOMER WHERE CUSTOMER.cust_id='${customer_id}'`
    const command2 =
    `SELECT * FROM cust_event LEFT JOIN BIRTHDAY ON BID=EID LEFT JOIN WEDDING ON WID=EID LEFT JOIN GENERAL ON GID=EID NATURAL JOIN Event_Manager NATURAL JOIN Venue_Manager NATURAL JOIN Caterer`

    clgmsg('command1:', command1)
    clgmsg('command2',command2)

    const promise_run_commands = new Promise((resolve,reject) => resolve(true))
    return await promise_run_commands
    .then(() => pool.query(command1).catch(err1 =>  clgmsg('err1',err1)))
    .then(() => pool.query(command2)
        .then(res => {
            // console.log(res.rows)
            return res.rows
        })
        .catch(err2 =>  clgmsg('err2 ',err2))
    )
    .catch(err => { clgmsg('err: ',err); return false })

}


event.get('/get-all-event-details/:customer_id',async (req, res) =>{
    clgmsg('req',JSON.stringify(req.params))
    const customer_id = req.params.customer_id;
    try {
        const deleted = await deleteViews(); // delete views to prevent the error while creating new views
        if(deleted === true){
            const event_details = await getOverallDetails(customer_id);
            if(event_details === false) res.send("0");
            else {
                // console.table(event_details);
                res.send(event_details);
            }
            return;
        }
    }
    catch (err) {
        clgmsg('error: ', err);
        return  res.send("0");
    }

})


module.exports = event;