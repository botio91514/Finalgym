const mongoose = require('mongoose');

const SalePaymentSchema = new mongoose.Schema({
    sale: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'StoreSale',
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    paymentMode: {
        type: String,
        enum: ['cash', 'online'], // Matching your Gym Payment modes (GPay/Cash)
        required: true
    },
    transactionId: {
        type: String,
        trim: true
    },
    paymentDate: {
        type: Date,
        default: Date.now
    },
    receivedBy: {
        // If you had staff, we'd link it here. For now, it sends the Admin name or "System"
        type: String,
        default: 'Admin'
    },
    notes: String
}, { timestamps: true });

module.exports = mongoose.model('SalePayment', SalePaymentSchema);
