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
    .then(res =>{
        clgmsg("sendres",res);
        return res;
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
