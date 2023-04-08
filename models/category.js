const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        minlength: 5,
        maxlength: 10,
        required: true
    },
    transactions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' }],
    totalAmountInside: {
        type: Number,
        default: 0
    }
});

const Category = new mongoose.model('Category', categorySchema);

function validateCategory(category) {
    const schema = Joi.object({
        name: Joi.string().min(5).max(10).required(),
        transactions: Joi.objectId()
    });

    return schema.validate(category);
}

exports.Category = Category;
exports.validate = validateCategory;