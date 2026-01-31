const mongoose = require('mongoose');
const Product = require('../models/Product');
const ProductCategory = require('../models/ProductCategory');
const StoreSale = require('../models/StoreSale');
const SalePayment = require('../models/SalePayment');
const User = require('../models/User');
const { uploadToCloudinary, deleteFromCloudinary } = require('../services/cloudinaryService');
const { sendEmail, createStoreBalanceEmail, createStorePurchaseSuccessEmail } = require('../services/emailService');

// --- PRODUCT CATEGORIES ---

exports.createCategory = async (req, res) => {
    try {
        const category = await ProductCategory.create(req.body);
        res.status(201).json({ success: true, data: category });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

exports.getCategories = async (req, res) => {
    try {
        const categories = await ProductCategory.find({ isActive: true });
        res.status(200).json({ success: true, data: categories });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// --- PRODUCTS ---

exports.createProduct = async (req, res) => {
    try {
        let productData = { ...req.body };

        // Handle Image Upload
        if (req.file) {
            // Get category name for folder
            const category = await ProductCategory.findById(productData.category);
            const folderName = category ? `products/${category.name.toLowerCase().replace(/\s+/g, '-')}` : 'products/uncategorized';

            const imageUrl = await uploadToCloudinary(
                req.file.buffer,
                req.file.mimetype,
                folderName
            );
            productData.image = imageUrl;
        }

        const product = await Product.create(productData);
        res.status(201).json({ success: true, data: product });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

exports.getProducts = async (req, res) => {
    try {
        const query = req.query.includeInactive === 'true' ? {} : { status: 'active' };
        const products = await Product.find(query).populate('category').lean();

        // Calculate purchasing behavior stats (Ratings based on Sales)
        // We look at confirmed and completed sales
        const salesStats = await StoreSale.aggregate([
            { $match: { orderStatus: { $in: ['confirmed', 'completed'] } } },
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$items.product',
                    totalSold: { $sum: '$items.quantity' },
                    uniqueBuyers: { $sum: 1 }
                }
            }
        ]);

        const statsMap = {};
        salesStats.forEach(stat => {
            statsMap[stat._id.toString()] = stat;
        });

        // Attach stats to products
        const productsWithStats = products.map(product => {
            const stats = statsMap[product._id.toString()] || { totalSold: 0, uniqueBuyers: 0 };

            // LOGIC: Rating count is number of times purchased
            // Ratings stars: Base of 4.2, increases slightly with sales, capped at 5.0
            const totalSold = stats.totalSold;
            const ratingCount = totalSold;

            let rating = 4.2; // Base rating for all products
            if (totalSold > 0) {
                // Progression: 4.2 -> 5.0 over 50 sales
                rating = Math.min(5.0, 4.2 + (totalSold / 50) * 0.8);
            }

            return {
                ...product,
                rating: parseFloat(rating.toFixed(1)),
                ratingCount: ratingCount
            };
        });

        res.status(200).json({ success: true, data: productsWithStats });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        let updateData = { ...req.body };

        // Handle Image Upload
        if (req.file) {
            // Get category name for folder (either from updateData or from existing product)
            let categoryId = updateData.category;
            if (!categoryId) {
                const existingProduct = await Product.findById(req.params.id);
                categoryId = existingProduct?.category;
            }

            const category = await ProductCategory.findById(categoryId);
            const folderName = category ? `products/${category.name.toLowerCase().replace(/\s+/g, '-')}` : 'products/uncategorized';

            const imageUrl = await uploadToCloudinary(
                req.file.buffer,
                req.file.mimetype,
                folderName
            );
            updateData.image = imageUrl;
        }

        const product = await Product.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
            runValidators: true
        });

        if (!product) {
            return res.status(404).json({ success: false, error: 'Product not found' });
        }
        res.status(200).json({ success: true, data: product });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) throw new Error('Product not found');

        // Delete from Cloudinary if image exists and is not a placeholder
        if (product.image && product.image.includes('cloudinary.com')) {
            try {
                // Extract public ID: https://res.cloudinary.com/cloud/image/upload/v123/folder/id.jpg -> folder/id
                const parts = product.image.split('/upload/');
                if (parts.length > 1) {
                    const idWithExtension = parts[1].split('/').slice(1).join('/');
                    const publicId = idWithExtension.split('.')[0];
                    await deleteFromCloudinary(publicId);
                }
            } catch (cloudErr) {
                console.error('Failed to delete image from Cloudinary:', cloudErr);
                // Don't fail the product deletion if image cleanup fails
            }
        }

        // Soft delete: Mark as inactive
        product.status = 'inactive';
        product.image = 'https://placehold.co/600x400?text=Deleted'; // Set to deleted placeholder
        await product.save();

        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// --- SALES & PAYMENTS ---

exports.createSale = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { items, customerEmail, customerName, customerPhone, paymentMode, paidAmount } = req.body;

        // 1. Calculate Totals & Verify Stock
        let totalAmount = 0;
        const saleItems = [];

        for (const item of items) {
            const product = await Product.findById(item.productId).session(session);

            if (!product) {
                throw new Error(`Product not found: ${item.productId}`);
            }
            if (product.stockQuantity < item.quantity) {
                throw new Error(`Insufficient stock for ${product.name}. Available: ${product.stockQuantity}`);
            }

            // Deduct Stock
            product.stockQuantity -= item.quantity;
            await product.save({ session });

            const itemDiscount = product.discount || 0;
            const finalPrice = product.price - (product.price * itemDiscount / 100);

            // Fetch category for name
            const category = await ProductCategory.findById(product.category).session(session);

            saleItems.push({
                product: product._id,
                productName: product.name,
                categoryId: product.category,
                categoryName: category?.name || 'Uncategorized',
                quantity: item.quantity,
                originalPrice: product.price,
                discount: itemDiscount,
                priceAtSale: finalPrice
            });

            totalAmount += (finalPrice * item.quantity);
        }

        // 2. Identify Member (Smart Match)
        let memberId = null;
        let guestDetails = null;

        if (customerEmail) {
            const member = await User.findOne({ email: customerEmail });
            if (member) {
                memberId = member._id;
            } else {
                guestDetails = {
                    name: customerName || 'Guest',
                    email: customerEmail,
                    phone: customerPhone
                };
            }
        } else {
            // Fallback for guest without email (walk-in cash)
            guestDetails = {
                name: customerName || 'Walk-in Guest',
                phone: customerPhone
            };
        }

        // 3. Create Sale Record
        const sale = await StoreSale.create([{
            member: memberId,
            guestDetails: guestDetails,
            items: saleItems,
            totalAmount: totalAmount,
            paidAmount: paidAmount || 0,
            paymentMode: paymentMode || 'cash'
        }], { session });

        const newSale = sale[0]; // create returns array with session

        // 4. Record Payment (if any)
        if (paidAmount > 0) {
            await SalePayment.create([{
                sale: newSale._id,
                amount: paidAmount,
                paymentMode: paymentMode || 'cash',
                receivedBy: 'System'
            }], { session });
        }

        await session.commitTransaction();
        res.status(201).json({ success: true, data: newSale });

    } catch (error) {
        await session.abortTransaction();
        res.status(400).json({ success: false, error: error.message });
    } finally {
        session.endSession();
    }
};

exports.getSales = async (req, res) => {
    try {
        const sales = await StoreSale.find()
            .populate('member', 'name email photo')
            .populate('items.product', 'name')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: sales });
    } catch (error) {
        console.error('getSales Error:', error);
        res.status(400).json({ success: false, error: error.message });
    }
};

exports.addPayment = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { saleId, amount, paymentMode, notes } = req.body;

        const sale = await StoreSale.findById(saleId).populate('member').session(session);
        if (!sale) throw new Error('Sale not found');

        const remainingBalance = sale.totalAmount - sale.paidAmount;
        if (amount > remainingBalance) {
            throw new Error(`Payment exceeds remaining balance of ₹${remainingBalance}`);
        }

        // Add Payment Record
        await SalePayment.create([{
            sale: saleId,
            amount,
            paymentMode,
            notes,
            receivedBy: 'Admin'
        }], { session });

        // Update Sale Totals
        sale.paidAmount += amount;
        await sale.save({ session });

        // Email Notification for Balance
        const customerEmail = sale.member ? sale.member.email : sale.guestDetails?.email;
        const customerName = sale.member ? sale.member.name : sale.guestDetails?.name;

        if (customerEmail) {
            try {
                if (sale.balanceAmount > 0) {
                    await sendEmail({
                        email: customerEmail,
                        subject: 'Payment Received Update - Star Gym Store',
                        html: createStoreBalanceEmail(sale, customerName)
                    });
                } else {
                    // Fetch full sale with populated items for the success email
                    const fullSale = await StoreSale.findById(sale._id).populate('items.product');
                    await sendEmail({
                        email: customerEmail,
                        subject: 'Purchase Successful - Star Gym Store 🎉',
                        html: createStorePurchaseSuccessEmail(fullSale, customerName)
                    });
                }
            } catch (mailError) {
                console.error('Failed to send store payment email:', mailError);
            }
        }

        await session.commitTransaction();
        res.status(200).json({ success: true, data: sale });

    } catch (error) {
        await session.abortTransaction();
        res.status(400).json({ success: false, error: error.message });
    } finally {
        session.endSession();
    }
};

exports.approveSale = async (req, res) => {
    try {
        const sale = await StoreSale.findById(req.params.id);
        if (!sale) throw new Error('Sale not found');

        // Check if fully paid
        if (sale.paymentStatus !== 'paid') {
            throw new Error(`Cannot approve sale. Payment is not fully completed (Current status: ${sale.paymentStatus})`);
        }

        sale.orderStatus = 'confirmed';
        await sale.save();

        res.status(200).json({ success: true, data: sale });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

exports.rejectSale = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const sale = await StoreSale.findById(req.params.id).session(session);
        if (!sale) throw new Error('Sale not found');

        if (sale.orderStatus === 'cancelled') throw new Error('Sale is already cancelled');

        // Restore Stock
        for (const item of sale.items) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { stockQuantity: item.quantity }
            }, { session });
        }

        sale.orderStatus = 'cancelled';
        await sale.save({ session });

        await session.commitTransaction();
        res.status(200).json({ success: true, data: sale });
    } catch (error) {
        await session.abortTransaction();
        res.status(400).json({ success: false, error: error.message });
    } finally {
        session.endSession();
    }
};
