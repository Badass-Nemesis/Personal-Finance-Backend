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
        required: true,
        minlength: 5,
        maxlength: 6
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