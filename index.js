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

app.post("/new-customer", async (req, res) => {
    try {
        console.log(req.body);
        const description = req.body.cust_name;
        const newCust = await pool.query(
            "INSERT INTO todo (cust_name) VALUES ($1)",
            [description]
        );
        res.json(newCust.rows[0]);
    } catch (err) {
        console.log(`Error occurred ${err}`);
        res.send("Error  -1");
    }
});

function clgmsg(msg, msg2 = "") {
    console.log(`${msg} ${msg2}`);
}

async function isValidMaganer(username, password) {
    const command = `SELECT m_id, password FROM Event_Manager WHERE m_id=$1 AND password=$2`;
    const details = [username, password];

    return await pool.query(command,details)
    .then(res =>{
        // clgmsg("respose",JSON.stringify(res.rows));
        return res.rows.length === 1 ? 1  : 0;
    })
    .then(res =>{
        clgmsg("sendres",res);
        return res;
    })
    .catch(err => {
        setImmediate(() => {
            throw err;
        })
    })

}

app.post("/login", async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    clgmsg(username, password);
    try {
        if (username[0] === "M") {
            // if username is of event manager
            const result = await isValidMaganer(username, password);
            clgmsg('result',result);
            if (result === 1) {
                clgmsg("ok?");
                return res.status(200).send("1");
            } else {
                clgmsg("isValidManager", result);
                console.log(`not valid`)
                return res.status(404).send("0");
            }
        }
    } catch (err) {
        clgmsg("error occurred: ", err);
        res.send("0");
        return;
    } finally {
        clgmsg("do something");
        // res.status(404).send("0");
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
