const express = require("express");
const event = express.Router();
const pool = require("../startup/db");
const clgmsg = require("../startup/logger");

function catchError(err) {
    clgmsg("err :", err);
    throw err;
}


async function getId(num, pref, tablename,table_id, client) {
    let newEventId = Number(num) + 1;
    if (newEventId < 10) newEventId = `${pref}0000${newEventId}`;
    else if (newEventId < 100) newEventId = `${pref}000${newEventId}`;
    else newEventId = `${pref}00${newEventId}`;

    return await client
    .query(`select * from ${tablename} where ${table_id}=$1`,[newEventId])
    .then(async (res) =>{
        console.log(res.rows.length)
        if(res.rows.length > 0){
            return await getId(Number(num)+1, pref, tablename, table_id, client)
        } else {
            return newEventId;
        }
    })
}


event.post("/insert", async (req, res) => {
    const payload = req.body;
    let event_id, m_id;
    const client = await pool.connect();

    const p = new Promise((resolve, reject) => resolve(true));

    return await p
        .then(() => client.query("BEGIN"))
        .then(() => {
            // event
            return client.query("SELECT COUNT(*) FROM EVENT");
        })
        .then((res) => res.rows[0].count)
        .then((num) => getId(num, "E","event","eid",client))
        .then((id) => {
            event_id = id;
            const details =
            [
                id,
                Number(payload.event.budget),
                Number(payload.event.audience),
                payload.event.start_dt,
                payload.event.end_dt,
                payload.customer_id,
            ]
            clgmsg("event details: ", details);
            return client.query(
                "INSERT INTO EVENT VALUES ($1,$2,$3,$4,$5,$6)",
                details
            );
        })
        .then(() => {
            clgmsg("inserted: Event");
        })

        .then(async () => {
            // assigning an event manager who is currently unassigned to event
            return await client
                .query("SELECT * FROM event_manager WHERE eid IS NULL")
                .then((res) => res.rows)
                .catch((err) => catchError(err));
        })
        .then((res) => {
            m_id = res[0].m_id;
            return m_id;
        })
        .then(async (m_id) => {
            return await client
                .query(
                    `UPDATE event_manager SET eid='${event_id}' WHERE m_id='${m_id}'`
                )
                .then((res) => clgmsg("res", res))
                .catch((err) => catchError(err));
        })

        .then(() => {
            // venue
            return client.query("SELECT COUNT(*) FROM venue");
        })
        .then((res) => res.rows[0].count)
        .then((num) => getId(num, "V","venue","vid",client))
        .then(async (id) => {
            const details = [
                id,
                m_id,
                payload.venue.venue_name,
                payload.venue.venmgr_city,
            ];
            clgmsg("venue+manager details: ", details);

            return await client
                .query("INSERT INTO venue VALUES ($1,$2,$3,$4)", details)
                .catch((err) => catchError(`ERR: ${err}`));
        })
        .then(() => {
            clgmsg("inserted: venue");
        })
        .then(() => {
            // decoration
            return client.query("SELECT COUNT(*) FROM decoration");
        })
        .then((res) => res.rows[0].count)
        .then((num) => getId(num, "D","decoration","did",client))
        .then(async (id) => {
            const details = [
                id,
                m_id,
                payload.decoration.plan,
                payload.decoration.special_requirement,
                payload.decoration.theme,
            ];
            clgmsg("event details: ", details);
            return await client
                .query(
                    "INSERT INTO decoration VALUES ($1,$2,$3,$4,$5)",
                    details
                )
                .catch((err) => catchError(err));
        })
        .then(() => {
            clgmsg("inserted: decoration");
        })

        .then(() => {
            // catering
            return client.query("SELECT COUNT(*) FROM catering");
        })
        .then((res) => res.rows[0].count)
        .then((num) => getId(num, "C","catering","cid",client))
        .then(async (id) => {
            const details = [
                id,
                m_id,
                payload.catering.style,
                payload.catering.cuisine,
                payload.catering.num_plates,
            ];
            clgmsg("catering details: ", details);
            return await client
                .query(
                    "INSERT INTO catering VALUES ($1,$2,$3,$4,$5)",
                    details
                )
                .catch((err) => catchError(err));
        })
        .then(() => {
            clgmsg("inserted: catering");
        })

        .then(async () => {
            // event, accordingly , if exists
            clgmsg('birthday outer:', payload?.birthday)
            clgmsg('wedding  outer:', payload?.wedding)
            clgmsg('general  outer:', payload?.general)

            clgmsg('birthday', payload?.birthday?.bname)
            clgmsg('wedding', payload?.wedding?.bride_name)
            clgmsg('general', payload?.general?.event_name)
            let details, tuplenums, event_table;
            if (payload?.birthday?.bname !== undefined) {
                details = [
                    event_id,
                    payload.birthday.bname,
                    payload.birthday.age,
                    payload.birthday.entertainment,
                ];
                tuplenums = "($1,$2,$3,$4)";
                event_table = "BIRTHDAY";
            } else if (payload?.wedding?.bride_name !== undefined) {
                details = [
                    event_id,
                    payload.wedding.bride_name,
                    payload.wedding.groom_name,
                    payload.wedding.religion,
                ];
                tuplenums = "($1,$2,$3,$4)";
                event_table = "WEDDING";
            } else if (payload?.general?.event_name !== undefined) {
                details = [
                    event_id,
                    payload.general.event_name,
                    payload.general.description,
                    payload.general.purpose,
                ];
                tuplenums = "($1,$2,$3,$4)";
                event_table = "GENERAL";
            } else throw new Error("event details not mentioned");
            clgmsg("event table details", details);
            return await client
                .query(
                    `INSERT INTO ${event_table} VALUES ${tuplenums}`,
                    details
                )
                .catch((err) => catchError(err));
        })

        .then(() => {
            // phone_numbers
            clgmsg("cust_phone_details ", payload.cust_phone);
            payload.cust_phone.forEach((phno) => {
                client
                    .query("INSERT INTO cust_phone_number VALUES ($1,$2)", [
                        payload.customer_id,
                        phno,
                    ])
                    .catch((err) => catchError(err));
            });
        })
        .then(() => client.query("COMMIT").catch((err) => catchError(err)))
        .then(() => client.release())
        .then(() => res.send(true))

        .catch((err) => {
            clgmsg("err FINAL catch block", err);
            client.query("ROLLBACK");
            client.release();

            res.send(false);
            return false;
        });
});

module.exports = event;
