const mongoose = require('mongoose')
require('dotenv').config()
const debgr = require('debug')("development:mongoose")

mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        debgr("Connected to MongoDB");
    })
    .catch((err) => {
        console.error("Error connecting to MongoDB:", err.message);
    });

module.exports = mongoose.connection;
