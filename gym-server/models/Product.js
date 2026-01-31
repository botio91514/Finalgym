const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a product name'],
        trim: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProductCategory',
        required: [true, 'Please select a category']
    },
    description: {
        type: String,
        trim: true
    },
    price: {
        type: Number,
        required: [true, 'Please provide a selling price'],
        min: 0
    },
    discount: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    stockQuantity: {
        type: Number,
        required: [true, 'Please provide stock quantity'],
        min: 0,
        default: 0
    },
    minStockAlert: {
        type: Number,
        default: 5
    },
    image: {
        type: String,
        default: 'https://placehold.co/600x400?text=Product'
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Product', ProductSchema);
