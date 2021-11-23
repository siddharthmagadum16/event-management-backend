const express = require('express');
const event = express.Router();
const pool = require('../startup/db')
const clgmsg = require('../startup/logger')




function catchError(err){
    clgmsg('err :',err);
    throw err
}



function getId(num,pref){
    let newEventId= Number(num) + 1;
    if(newEventId <10 ) newEventId =`${pref}0000${newEventId}`
    else if(newEventId <100) newEventId = `${pref}000${newEventId}`
    else newEventId = `${pref}00${newEventId}`
    return newEventId
}

event.post('/insert', async (req,res)=> {

    const payload = req.body;
    let event_id,m_id;
    const client = await pool.connect();


    const p = new Promise((resolve, reject) => resolve(true));

    return await p
    .then(() => client.query('BEGIN'))
    .then(() =>{ // event
        return client.query('SELECT COUNT(*) FROM EVENT')
    })
    .then(res =>    res.rows[0].count)
    .then(num => getId(num,'E'))
    .then((id) => {
        event_id= id;
        const details = [id, Number(payload.event.budget), Number(payload.event.audience), new Date(),new Date(), payload.customer_id];
        clgmsg("event details: ",details)
        return client
        .query('INSERT INTO EVENT VALUES ($1,$2,$3,$4,$5,$6)',details)
    })
    .then(() => {
        clgmsg('inserted: Event')
    })


    .then(async() =>{ // assigning an event manager who is currently unassigned to event
        return await client.query('SELECT * FROM event_manager WHERE eid IS NULL')
        .then(res =>  res.rows )
        .catch(err => catchError(err))
    })
    .then(res =>{
        m_id = res[0].m_id;
        return m_id;
    })
    .then(async (m_id) =>{
        return await client.query(`UPDATE event_manager SET eid='${event_id}' WHERE m_id='${m_id}'`)
        .then(res => clgmsg('res',res))
        .catch(err => catchError(err))
    })


    .then(() =>{ // venue_manager
        return client.query('SELECT COUNT(*) FROM venue_manager')
    })
    .then(res =>    res.rows[0].count)
    .then(num =>  getId(num,'V'))
    .then(async (id) => {
        const details = [id, m_id, payload.venue_manager.venmgr_contact , payload.venue_manager.venmgr_commission, payload.venue_manager.venue_name, payload.venue_manager.venmgr_city ];
        clgmsg("venue+manager details: ",details)

        return await client
        .query('INSERT INTO venue_manager VALUES ($1,$2,$3,$4,$5,$6)',details)
        .catch(err =>  catchError(`ERR: ${err}`))
    })
    .then(() => {
        clgmsg('inserted: venue_manager')
    })


    .then(() =>{ // decorator
        return client.query('SELECT COUNT(*) FROM Decorator')
    })
    .then(res =>    res.rows[0].count)
    .then(num => getId(num,'D'))
    .then(async (id) => {
        const details = [id, m_id,payload.decorator.plan, payload.decorator.special_requirement , payload.decorator.theme, payload.decorator.decr_commission, payload.decorator.decr_contact ];
        clgmsg("event details: ",details)
        return await client
        .query('INSERT INTO decorator VALUES ($1,$2,$3,$4,$5,$6,$7)',details)
        .catch(err => catchError(err))
    })
    .then(() => {
        clgmsg('inserted: decorator')
    })


    .then(() =>{ // caterer
        return client.query('SELECT COUNT(*) FROM Caterer')
    })
    .then(res =>    res.rows[0].count)
    .then(num => getId(num,'C'))
    .then(async (id) => {
        const details = [id, m_id,payload.caterer.style, payload.caterer.cuisine , payload.caterer.num_plates, payload.caterer.ctr_commission, payload.caterer.ctr_contact ];
        clgmsg("caterer details: ",details)
        return await client
        .query('INSERT INTO caterer VALUES ($1,$2,$3,$4,$5,$6,$7)',details)
        .catch(err => catchError(err))
    })
    .then(() => {
        clgmsg('inserted: caterer')
    })



    .then(() => {// event, accordingly , if exists
        let details, tuplenums, event_table;
        if( payload?.birthday?.bname !== undefined ) {
            details = [event_id, payload.birthday.bname, payload.birthday.age, payload.birthday.entertainment]
            tuplenums = "($1,$2,$3,$4)"
            event_table = 'BIRTHDAY'
        }
        else if(payload?.wedding?.bride_name !== undefined ) {
            details = [event_id, payload.wedding.bride_name, payload.wedding.groom_name, payload.wedding.religion]
            tuplenums = "($1,$2,$3,$4)"
            event_table = 'WEDDING'
        }
        else if(payload?.general?.event_name !== undefined ) {
            details = [event_id, payload.general.event_name, payload.general.description, payload.general.purpose]
            tuplenums = "($1,$2,$3,$4)"
            event_table = 'GENERAL'
        }
        else throw new Error("event details not mentioned")
        clgmsg('event table details',details)
        return client.query(`INSERT INTO ${event_table} VALUES ${tuplenums}`,details)
        .catch(err => catchError(err))
    })


    .then(() =>{ // phone_numbers
        clgmsg('cust_phone_details ',payload.cust_phone)
        payload.cust_phone.forEach(phno => {
            client.query('INSERT INTO cust_phone_number VALUES ($1,$2)',[payload.customer_id, phno])
            .catch(err => catchError(err))
        })
    })
    .then(() => client.query('COMMIT').catch(err => catchError(err)))
    .then(() => client.release())
    .then(() => res.send(true))

    .catch(err =>{
        clgmsg('err FINAL catch block',err);
        client.query('ROLLBACK')
        client.release();

        res.send(false)
        return false;
    })

})



module.exports = event