const Joi = require('joi');
const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    dateAndTime: {
        type: Date,
        required: true
    },
    narration: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    transactionType: {
        type: String,
        required: true
    },
    referenceNumber: {
        type: String,
        unique: true
    },
    availableBalance: {
        type: Number,
        required: true
    },
    beneficiaryAccountNumber: {
        type: String,
    },
    beneficiaryName: {
        type: String,
    },
    remitterAccountNumber: {
        type: String,
    },
    remitterName: {
        type: String,
    },
    isPresentInCategory: {
        type: Boolean,
        default: false
    },
    categoryName: {
        type: String,
        default: ""
    }
});

transactionSchema.methods.getSubstring = function (str, start, length) {
    return str.substring(start, start + length);
};


transactionSchema.methods.convertToISO = function (req) {
    let dateTime = req.body.dateAndTime;
    let date = dateTime.substring(0, dateTime.indexOf(" "));
    let time = dateTime.substring(dateTime.indexOf(" ") + 1);
    let newDate = date.split("-").reverse().join("-");

    var final = new Date(`${newDate} ${time} +0530`);
    final.toISOString();

    return final;
}

const Transaction = new mongoose.model('Transaction', transactionSchema);

function validateTransaction(transaction) {
    const schema = Joi.object({
        dateAndTime: Joi.string().required(),
        narration: Joi.string().required(),
        amount: Joi.number().required(),
        transactionType: Joi.string().allow('Credit').allow('Debit').required(),
        referenceNumber: Joi.string().allow('').required(),
        availableBalance: Joi.number().required(),
        beneficiaryAccountNumber: Joi.string().allow('').required(),
        beneficiaryName: Joi.string().allow('').required(),
        remitterAccountNumber: Joi.string().allow('').required(),
        remitterName: Joi.string().allow('').required(),
        isPresentInCategory: Joi.boolean(),
        categoryName: Joi.string()
    });

    return schema.validate(transaction);
}

exports.Transaction = Transaction;
exports.validate = validateTransaction;