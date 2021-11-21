require('dotenv').config();
const express = require("express");
const app = express();
const cors = require("cors");
const pool = require("./db");

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Hi hello test respose");
});


function clgmsg(msg, msg2 = "") {
    console.log(`${msg} ${msg2}`);
}

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

app.post("/login", async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    clgmsg(username, password);
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


async function getCustomerDetail__(customer_id){

    const command = `SELECT * FROM CUSTOMER WHERE cust_id=$1`

    return await pool.query(command,[customer_id])
    .then(res =>{
        console.log(`table:`)
        // console.table(res.rows)
        return res
    })
    .catch(err =>{
        clgmsg('error: ', err);
        throw err
    })
}

async function getCustomerDetails(customer_id){

    const command = `SELECT * FROM CUSTOMER WHERE cust_id=$1`

    return await pool.query(command,[customer_id])
    .then(res =>{
        // console.table(res.rows)
        return res
    })
    .catch(err =>{
        clgmsg('error: ', err);
        throw err
    })
}

async function deleteViews(){
    // let q1,q2,q3,q4;
    const promise_drop_tables= new Promise((resolve, reject) =>{
        resolve(true)
    });
    return await promise_drop_tables
    .then( res => pool.query('drop view if exists cust_event_evnt3 cascade') .then(res=> true).catch(err => console.log(err)))
    .then( res => pool.query('drop view if exists cust_event_evnt2 cascade') .then(res=> true).catch(err => console.log(err)))
    .then( res => pool.query('drop view if exists cust_event_evnt1 cascade') .then(res=> true).catch(err => console.log(err)))
    .then( res => pool.query('drop view if exists cust_event cascade') .then(res=> true).catch(err => console.log(err)))
    .then( res => {
        return true;
    })
    .catch(err => {
        clgmsg('error while deleting tables', err);
        return false;
    })
}

async function getOverallDetails(customer_id) {
    // const cust_details = await getCustomerDetails(customer_id)
    // const command = `CREATE VIEW tmpview AS SELECT * FROM  EVENT INNER JOIN CUSTOMER ON CUSTOMER.cust_id=$1 AND EVENT.CUST_ID=CUSTOMER.CUST_ID`

    const command1 = `CREATE VIEW cust_event AS SELECT * FROM  EVENT NATURAL INNER JOIN CUSTOMER WHERE CUSTOMER.cust_id='C00002'`

    clgmsg('command:', command1)
    // const result = await pool
    // .query(command)
    // .then(res => {
    //     console.table(res.rows);
    // })
    // .catch(err => {
    //     clgmsg('error: ', err);
    //     throw err;
    // })

    const command2 = `CREATE VIEW cust_event_evnt1 AS SELECT * FROM BIRTHDAY   RIGHT JOIN cust_event ON BID=EID`;
    const command3 = `CREATE VIEW cust_event_evnt2 AS SELECT * FROM WEDDING   RIGHT JOIN cust_event_evnt1 ON WID=EID`;
    const command4 = `CREATE VIEW cust_event_evnt3 AS SELECT * FROM GENERAL   RIGHT JOIN cust_event_evnt2 ON GID=EID`;
    const command5 = `SELECT * FROM cust_event_evnt3`

    const promise_run_commands = new Promise((resolve,reject) => resolve(true))
    return await promise_run_commands
    .then(() => pool.query(command1).catch(err1 =>  clgmsg('err1',err1)))
    .then(() => pool.query(command2).catch(err2 =>  clgmsg('err2',err2)))
    .then(() => pool.query(command3).catch(err3 =>  clgmsg('err3',err3)))
    .then(() => pool.query(command4).then(res => { console.table(res.rows); return res}).catch(err4 =>  clgmsg('err4',err4)))
    .then(() => {
        return pool.query(command5)

        // .catch(err =>{
        //     clgmsg('err:',err); return false;
        // })
    })
    .then(res=>{
        console.table(res.rows);
        return res.rows;
    })
    .catch(err => { clgmsg('err: ',err); return false })

}

// getOverallDetails('C00002')

app.get('/get-customer-events',async (req, res) =>{
    // const customer_id = 'C00002'; // needs to be modified
    const customer_id = req.body.customer_id;
    try {
        const deleted = await deleteViews();
        if(deleted === true){
            const event_details = await getOverallDetails(customer_id);
            if(event_details === false) res.send("0");
            else {
                console.table(event_details);
                res.send("1")
            }
            return;
        }
    }
    catch (err) {
        clgmsg('error: ', err);
        return  res.send("0");
    }

})




const port = process.env.PORT || 4000;

app.listen(port, (err) => {
    if (err) return clgmsg("app.listen:err:", err);
    console.log(`app is listening on port: ${port}`);
});

/*

else if (username[0] === 'C') {
    if (isValidMaganer(username, password)) {
        res.status(200).send("1");
        return;
    }
}

const tmp = await pool.query(command, details, (err, res) => {
const tmp = await pool.query(command,details)
    if (err) {
        throw new Error`Error: in isValidManager`();
    } else {
        const Rows = res.rows;
        const val = JSON.stringify(res.rows);
        // clgmsg("stringify:", val); // output=> stringify: [{"m_id":"M00002","password":"password2"}]
        // clgmsg("rowlen", Rows.length); // rowlen 1
        if (Rows.length === 1) return 1;
        else return 0;
    }


(async () => {
        const { rows } = await pool.query(command, details)
        // clgmsg("rows", JSON.stringify(rows))
        if(rows.length === 1) return 1;
        else {
            console.log(`logic is correct`);
            return 0;
        }
    })()
    .catch(err =>
        setImmediate(() => {
          throw err
        })
    )

*/
