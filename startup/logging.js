const winston = require('winston');
require('winston-mongodb');
require('express-async-errors');
require('dotenv').config();

module.exports = function () {
    winston.exceptions.handle(
        new winston.transports.Console({ colorize: true, prettyPrint: true }),
        new winston.transports.File({ filename: 'uncaughtExpcetions.log' })
    );

    process.on('unhandeledRejections', (ex) => {
        throw ex;
    });

    winston.add(new winston.transports.File({ filename: 'logfile.log' }));

    winston.add(new winston.transports.MongoDB({
        db: process.env.DB,
        options: { useUnifiedTopology: true },
        level: 'info'
    }));
}