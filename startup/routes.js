const express = require('express')
const cors = require("cors");


module.exports = function(app) {
    app.use(cors());
    app.use(express.json());

    app.use('/auth/', require('../routes/auth.js'))
    app.use('/api/event-details/', require('../routes/event-details.js'))
    app.use('/event/', require('../routes/event'))
    app.use('/api/manager/', require('../routes/manager'))
}