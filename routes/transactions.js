const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const { Transaction, validate } = require('../models/transaction');
const { Category } = require('../models/category');
const _ = require('lodash');
const moment = require('moment');
const auth = require('../middleware/auth');
const axios = require('axios');
const Joi = require('joi');
require('dotenv').config();

router.get('/', auth, async (req, res) => {
    const transactions = await Transaction.find().sort('-dateAndTime');
    return res.send(transactions);
});

router.get('/:minusDays', auth, async (req, res) => {
    const transactions = await Transaction.find().sort('-dateAndTime');
    const currentDate = moment().subtract(req.params.minusDays, 'days');
    const filteredTransactions = transactions.filter(transaction => moment(transaction.dateAndTime).isSameOrAfter(currentDate));
    return res.send(filteredTransactions);
});

router.get('/search/byRef', auth, async (req, res) => {
    const transaction = await Transaction.findOne({ referenceNumber: req.body.referenceNumber });
    if (!transaction) return res.status(404).send('Transaction does not exist');

    return res.status(200).send(transaction);
});

// router.get('/upload/local', async (req, res) => {
//     const uploading = require('../excel/uploading');
//     await uploading();
//     return res.send('Done uploading');
// });

router.get('/fix/credit', auth, async (req, res) => {
    const transactions = await Transaction.find({ transactionType: "Credit" });
    await axios.post(`${process.env.BASE_URL}/api/category/newCategory`, { "name": "credit" }, { headers: { 'x-auth-token': process.env.TOKEN } })
        .catch(error => {
            // console.log(error);
        })
    // transactions.forEach(async transaction => {
    //     const temp = { "name": "credit", "transactions": transaction._id }
    //     await axios.post(`${process.env.BASE_URL}/api/category/pushTransactions`, temp)
    //         // .then(console.log('done'))
    //         .catch(error => {
    //             // console.log(error);
    //         });
    // })

    let index = 0;
    function sendRequest() {
        if (index == transactions.length) return;
        axios.post(`${process.env.BASE_URL}/api/category/pushTransactions`,
            { "name": "credit", "transactions": transactions[index]._id },
            { headers: { 'x-auth-token': process.env.TOKEN } })
            .then(response => {
                // console.log(response.data);
                index++;
                setTimeout(sendRequest, 1000);
            })
            .catch(error => {
                // console.error(error);
            });
    }

    sendRequest();

    return res.send('Done fixing');
});

router.get('/updown/gmail', auth, async (req, res) => {
    let down = require('../excel/downloading');
    let up = require('../excel/uploading');

    await down()
        .then(await up())
        .then(async () => {
            await axios.post(`${process.env.BASE_URL}/api/category/newCategory`, { "name": "credit" }, { headers: { 'x-auth-token': process.env.TOKEN } })
                .catch(error => { })
        })
        .then(async () => {
            await axios.get(`${process.env.BASE_URL}/api/transactions/fix/credit`, { headers: { 'x-auth-token': process.env.TOKEN } })
                .catch(error => { })
        })
        .catch(error => {
            console.log(error)
        });

    return res.send('Done downloading');
});

router.post('/add/manual', auth, async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let transaction = await Transaction.findOne({ referenceNumber: req.body.referenceNumber });
    if (transaction) return res.status(400).send('Transaction already present in db');

    // fixing dateAndTime
    const datetime = req.body.dateAndTime;
    const date = new Date(datetime);
    const formattedDatetime = date.toLocaleString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false
    }).replace(",", "").trim();
    req.body.dateAndTime = formattedDatetime;


    transaction = new Transaction(_.pick(req.body, ['dateAndTime', 'narration', 'amount', 'transactionType', 'referenceNumber', 'availableBalance', 'beneficiaryAccountNumber', 'beneficiaryName', 'remitterAccountNumber', 'remitterName']));
    transaction.dateAndTime = transaction.convertToISO(req);
    await transaction.save()
        .then(async () => {
            if (transaction.isPresentInCategory == 'Credit') {
                await axios.get(`${process.env.BASE_URL}/api/transactions/fix/credit`, { headers: { 'x-auth-token': process.env.TOKEN } }).catch(error => { })
            }
        })


    return res.send(transaction);
});

router.post('/', auth, async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let transaction = await Transaction.findOne({ referenceNumber: req.body.referenceNumber });
    if (transaction) return res.status(400).send('Transaction already present in db');

    transaction = new Transaction(_.pick(req.body, ['dateAndTime', 'narration', 'amount', 'transactionType', 'referenceNumber', 'availableBalance', 'beneficiaryAccountNumber', 'beneficiaryName', 'remitterAccountNumber', 'remitterName']));
    transaction.dateAndTime = transaction.convertToISO(req);
    await transaction.save();

    return res.send(transaction);
});

router.post('/getYearMonth', auth, async (req, res) => {
    function validateData(data) {
        const schema = Joi.object({
            year: Joi.number().min(2014).required(),
            month: Joi.number().min(1).max(12).required()
        });
        return schema.validate(data);
    }

    const { error } = validateData(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const transactions = await Transaction.find();
    let filteredTransactions = transactions.filter(transaction => moment(transaction.date).year() == req.body.year);
    filteredTransactions = filteredTransactions.filter(transaction => moment(transaction.date).month() <= req.body.month);

    return res.send(filteredTransactions);
});

router.delete('/', auth, async (req, res) => {
    const transaction = await Transaction.findOne({ referenceNumber: req.body.referenceNumber });
    if (!transaction) return res.status(404).send('Transaction does not exist');

    if (transaction.isPresentInCategory == true) {
        const category = await Category.find({ transactions: { $in: new mongoose.Types.ObjectId(transaction._id) } });
        await category[0].transactions.remove(transaction._id);
        await category[0].save();
    }

    await transaction.remove();

    return res.send(transaction);
});

module.exports = router;