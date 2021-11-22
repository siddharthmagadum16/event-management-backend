require('dotenv').config();
const express = require("express");
const app = express();
const pool = require("./startup/db");
const clgmsg = require('./startup/logger')
const port = process.env.PORT || 4000;

require('./startup/routes')(app)


app.get("/", (req, res) => {
    res.send("Hi hello test respose");
});


app.on('listening', () => {
    console.log('server is running on port : '+port)
})

app.listen(port, (err) => {
    if (err) return clgmsg("app.listen:err:", err);
    console.log(`app is listening on port: ${port}`);
});
