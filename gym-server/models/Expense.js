const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please provide an expense title'],
        trim: true
    },
    amount: {
        type: Number,
        required: [true, 'Please provide an amount']
    },
    category: {
        type: String,
        enum: ['Rent', 'Utilities', 'Salaries', 'Maintenance', 'Equipment', 'Marketing', 'Other'],
        default: 'Other',
        required: true
    },
    date: {
        type: Date,
        default: Date.now,
        required: true
    },
    paymentMethod: {
        type: String,
        enum: ['Cash', 'Online'],
        default: 'Cash'
    },
    description: {
        type: String,
        trim: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Expense', ExpenseSchema);
