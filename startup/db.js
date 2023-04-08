const winston = require('winston');
const mongoose = require('mongoose');
const config = require('config');
require('dotenv').config();

module.exports = function () {
    const db = process.env.ONLINE_DB;
    mongoose.set('strictQuery', true); // this is only written to supress a warning in mongoose 7 upgradation

    mongoose.connect(db)
        .then(() => winston.info(`Connected to ${db}...`));
}