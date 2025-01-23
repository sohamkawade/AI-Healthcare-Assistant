const mongoose = require('mongoose')
const config = require('config')
const debgr = require('debug')("development:mongoose")

mongoose.connect(`${config.get("MONGODB_URI")}/healthcare_db`)
    .then(() => {
        debgr("Connected to MongoDB");
    })
    .catch((err) => {
        console.error("Error connecting to MongoDB:", err.message);
    });

module.exports = mongoose.connection;
