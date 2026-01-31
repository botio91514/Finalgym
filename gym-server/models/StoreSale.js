const mongoose = require('mongoose');

const StoreSaleSchema = new mongoose.Schema({
    // Link to Member if they exist
    member: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    // Guest details if not a member (or not logged in)
    guestDetails: {
        name: String,
        email: String,
        phone: String
    },
    // Sale Items
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        productName: String,
        categoryId: mongoose.Schema.Types.ObjectId,
        categoryName: String,
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        originalPrice: Number, // Price before discount
        discount: { type: Number, default: 0 }, // Discount % at time of sale
        priceAtSale: { // Final price after discount
            type: Number,
            required: true
        }
    }],
    // Financials
    totalAmount: {
        type: Number,
        required: true
    },
    paidAmount: {
        type: Number,
        default: 0
    },
    balanceAmount: {
        type: Number,
        default: 0
    },
    paymentMode: {
        type: String,
        enum: ['cash', 'online'],
        default: 'cash'
    },
    // Status Tracking
    paymentStatus: {
        type: String,
        enum: ['unpaid', 'partial', 'paid'],
        default: 'unpaid'
    },
    orderStatus: {
        type: String,
        enum: ['pending', 'confirmed', 'completed', 'cancelled'],
        default: 'pending'
    },
    saleDate: {
        type: Date,
        default: Date.now
    },
    notes: String
}, { timestamps: true });

// Pre-save hook to calculate balance and status
StoreSaleSchema.pre('save', function (next) {
    this.balanceAmount = this.totalAmount - this.paidAmount;

    if (this.paidAmount >= this.totalAmount) {
        this.paymentStatus = 'paid';
    } else if (this.paidAmount > 0) {
        this.paymentStatus = 'partial';
    } else {
        this.paymentStatus = 'unpaid';
    }

    next();
});

module.exports = mongoose.model('StoreSale', StoreSaleSchema);
