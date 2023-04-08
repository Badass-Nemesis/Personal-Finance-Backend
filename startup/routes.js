const express = require('express');
const category = require('../routes/category');
const user = require('../routes/user');
const transactions = require('../routes/transactions');
const chatadvice = require('../routes/chatadvice');
const auth = require('../routes/auth');
const error = require('../middleware/error');
const cors = require('cors');

module.exports = function (app) {
    app.use(express.json());
    app.use(cors());
    app.use('/api/category', category);
    app.use('/api/user', user);
    app.use('/api/transactions', transactions);
    app.use('/api/chatadvice', chatadvice);
    app.use('/api/auth', auth);
    app.use(error);
}