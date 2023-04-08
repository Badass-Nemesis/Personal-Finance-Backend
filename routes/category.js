const auth = require('../middleware/auth');
const express = require('express');
const { Category, validate } = require('../models/category');
const { Transaction } = require('../models/transaction');
const router = express.Router();
const _ = require('lodash');
const moment = require('moment');
const mongoose = require('mongoose');
const Joi = require('joi');

router.get('/', auth, async (req, res) => {
    const category = await Category.find().populate('transactions');
    return res.send(category);
});

router.get('/:minusDays', auth, async (req, res) => {
    let categories = await Category.find().populate('transactions');
    const currentDate = moment().subtract(req.params.minusDays, 'days');
    categories.forEach(category => {
        const filteredCategories = category.transactions.filter(transaction => moment(transaction.dateAndTime).isSameOrAfter(currentDate));
        category.transactions = filteredCategories;
    });

    let totalAmountInside = 0;
    categories.forEach(category => {
        category.transactions.forEach(transaction => {
            totalAmountInside += transaction.amount;
        });
        category.totalAmountInside = totalAmountInside;
        totalAmountInside = 0;
    });

    return res.send(categories);
});

router.post('/pushTransactions', auth, async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let category = await Category.findOne({ name: req.body.name });
    if (!category) return res.status(404).send('Category not found');

    if (category.transactions.includes(req.body.transactions)) return res.status(400).send('Transaction already in the category');

    const tempTransaction = await Transaction.findById(req.body.transactions);
    if (!tempTransaction) return res.status(400).send('No transaction of this id is present');
    if (tempTransaction.isPresentInCategory == true) return res.status(400).send('Transaction is already in another category');

    category.totalAmountInside += tempTransaction.amount;
    category.transactions.push(req.body.transactions);
    await category.save();

    tempTransaction.isPresentInCategory = true;
    tempTransaction.categoryName = req.body.name;
    await tempTransaction.save();

    return res.send(category);
});


router.post('/newCategory', auth, async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let category = await Category.findOne({ name: req.body.name });
    if (category) return res.status(400).send('Category is already present');

    category = new Category(_.pick(req.body, ['name']));
    await category.save();

    return res.send(category);
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

    let categories = await Category.find().populate('transactions');

    categories.forEach((category) => {
        let filteredTransactions = category.transactions.filter(transaction => moment(transaction.dateAndTime).year() == req.body.year);
        filteredTransactions = filteredTransactions.filter(transaction => moment(transaction.dateAndTime).month() <= req.body.month);
        category.transactions = filteredTransactions;

        let totalAmountInside = 0;
        category.transactions.forEach(transaction => {
            totalAmountInside += transaction.amount;
        });
        category.totalAmountInside = totalAmountInside;
        totalAmountInside = 0;
    })

    return res.send(categories);
});

router.get('/get/threemonths', auth, async (req, res) => {
    let currYear = moment().year();
    let currMonth = moment().month();
    // console.log(currMonth + " " + currYear); // debug
    const categories = await Category.find().populate('transactions');
    let tempCategories = JSON.parse(JSON.stringify(categories));
    let tempCategories2 = JSON.parse(JSON.stringify(categories));
    let tempCategories3 = JSON.parse(JSON.stringify(categories));

    let currMonthArray = [];
    tempCategories.forEach((category) => {
        // console.log(moment(category.transactions[0].dateAndTime).month() + " " + category.transactions[0]); // debug
        let filteredTransactions = category.transactions.filter(transaction => moment(transaction.dateAndTime).year() == currYear);
        // console.log(filteredTransactions); // debug
        filteredTransactions = filteredTransactions.filter(transaction => moment(transaction.dateAndTime).month() == currMonth);
        // console.log(filteredTransactions); // debug
        category.transactions = filteredTransactions;

        let totalAmountInside = 0;
        category.transactions.forEach(transaction => {
            totalAmountInside += transaction.amount;
        });
        category.totalAmountInside = totalAmountInside;
        currMonthArray.push(category);
        totalAmountInside = 0;
    })
    // console.log(currMonthArray); // debug

    let prevMonthArray = [];
    if (currMonth == 0) {
        currYear--;
        currMonth = 11;
    } else {
        currMonth--;
    }
    // console.log(currMonth + " " + currYear); // debug
    tempCategories2.forEach((category) => {
        let filteredTransactions = category.transactions.filter(transaction => moment(transaction.dateAndTime).year() == currYear);
        filteredTransactions = filteredTransactions.filter(transaction => moment(transaction.dateAndTime).month() == currMonth);
        category.transactions = filteredTransactions;

        let totalAmountInside = 0;
        category.transactions.forEach(transaction => {
            totalAmountInside += transaction.amount;
        });
        category.totalAmountInside = totalAmountInside;
        prevMonthArray.push(category);
        totalAmountInside = 0;
    })

    let prevPrevMonthArray = [];
    if (currMonth == 0) {
        currYear--;
        currMonth = 11;
    } else {
        currMonth--;
    }
    // console.log(currMonth + " " + currYear); // debug
    tempCategories3.forEach((category) => {
        let filteredTransactions = category.transactions.filter(transaction => moment(transaction.dateAndTime).year() == currYear);
        // console.log(filteredTransactions); // debug
        filteredTransactions = filteredTransactions.filter(transaction => moment(transaction.dateAndTime).month() == currMonth);
        category.transactions = filteredTransactions;

        let totalAmountInside = 0;
        category.transactions.forEach(transaction => {
            totalAmountInside += transaction.amount;
        });
        category.totalAmountInside = totalAmountInside;
        prevPrevMonthArray.push(category);
        totalAmountInside = 0;
    })

    let final = [currMonthArray, prevMonthArray, prevPrevMonthArray];
    return res.send(final);
});

router.delete('/deleteTransaction', auth, async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let category = await Category.findOne({ name: req.body.name });
    if (!category) return res.status(404).send('No category is present');

    if (category.transactions.length == 0 || !category.transactions.includes(req.body.transactions)) {
        return res.status(400).send('No transaction found');
    }

    let tempTransaction = await Transaction.findById(req.body.transactions);
    category.totalAmountInside -= tempTransaction.amount;

    await category.transactions.remove(req.body.transactions);
    await category.save();

    let transaction = await Transaction.findById(new mongoose.Types.ObjectId(req.body.transactions));
    transaction.isPresentInCategory = false;
    transaction.categoryName = '';
    await transaction.save();

    return res.send('Successfuly deleted transaction');
});

router.delete('/deleteCategory', auth, async (req, res) => {
    const category = await Category.findOne({ name: req.body.name });

    category.transactions.forEach(async transaction => {
        let temp = await Transaction.findById(new mongoose.Types.ObjectId(transaction));
        temp.isPresentInCategory = false;
        temp.categoryName = '';
        await temp.save();
    });

    if (!category) return res.status(404).send('No category is present');

    await category.remove();

    return res.send('Deleted successfuly');
});

module.exports = router;