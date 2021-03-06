const express = require("express");
const manager = express.Router();
const pool = require("../startup/db");
const clgmsg = require("../startup/logger");

manager.get("/manager-view/:manager_id", async (req, res) => {
    const manager_id = req.params.manager_id;
    clgmsg("manager_id", manager_id);
    const command = `SELECT * FROM event NATURAL JOIN event_manager NATURAL JOIN catering NATURAL JOIN decoration NATURAL JOIN venue WHERE m_id=$1`;
    const details = [manager_id];

    return await pool
        .query(command, details)
        .then((result) => {
            return res.send(result.rows);
        })
        .catch((err) => {
            res.send("0");
            clgmsg("err: ", err);
        });
});

manager.put("/update", async (req, res) => {
    const client = await pool.connect();
    const payload = req.body;
    const p = new Promise((resolve, reject) => resolve(true));

    p.then(() => {
        client.query("BEGIN");
    })
        .then(() => {
            payload.forEach((update) => {
                let command, tid, details;
                const tablename = update.tablename;
                if (tablename === "event") tid = "eid";
                else if (tablename === "event_manager") tid = "m_id";
                else if (tablename === "venue") tid = "vid";
                else if (tablename === "decoration") tid = "did";
                else if (tablename === "catering") tid = "cid";
                else if (tablename === "birthday") tid = "bid";
                else if (tablename === "general") tid = "gid";
                else if (tablename === "wedding") tid = "wid";
                else throw new Error("none of the table matches");
                command = `UPDATE ${tablename} SET ${update.name}=$1 WHERE ${tid}=$2`;
                details = [update.value, update.id];
                console.log(command);
                client
                    .query(command, details)
                    .then((res) => {
                        clgmsg("res", res);
                    })
                    .catch((err) => {
                        clgmsg("err:", err);
                        throw new Error(err);
                    });
            });
        })
        .then(() => client.query("COMMIT"))
        .then(() => res.send(true))
        .catch((err) => {
            console.log("this thing happened");
            clgmsg("err: ", err);
            client.query("ROLLBACK");
            res.send(false);
        })
        .finally(() => client.release());
});

manager.get("/delete/:eid", async (req, res) => {
    const event_id = req.params.eid;
    console.log('adfadsf')
    console.log(event_id)
    const client = await pool.connect();
    const p = new Promise((resolve,reject) => resolve(true))

    return await p
    .then(() => client.query("BEGIN"))
    .then(() =>{
        const command = `UPDATE event_manager SET eid=NULL WHERE eid=$1`;
        client.query(command , [event_id])
        .then(res =>{
            clgmsg('even_manager updated',"s")
        })
        .catch(err => {
            clgmsg("throw err:",err);
            throw new Error(err)
        })
    })
    .then(async() => {
        const command = "DELETE FROM event WHERE eid=$1";
        return await client.query(command, [event_id])
        .then(res => clgmsg("deleted event","d"))
        .catch((err) => { console.log(err); throw new Error(err) });
    })
    .then(() => {
        client.query('COMMIT');
        console.log('commited also')
    })
    .then(() => client.release())
    .then(() => res.send(true))
    .catch( err =>{
        clgmsg('final err:',err);
        client.query('ROLLBACK')
        client.release();
        res.send(false)
    })

});

module.exports = manager;
