const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect } = require('../middleware/auth');

// Multer Config
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});
const {
    createCategory,
    getCategories,
    createProduct,
    getProducts,
    updateProduct,
    deleteProduct,
    createSale,
    getSales,
    addPayment,
    approveSale,
    rejectSale
} = require('../controllers/storeController');

// --- PUBLIC ROUTES ---
// Anyone can view the store and buy products
router.get('/products', getProducts);
router.get('/categories', getCategories);
router.post('/sales', createSale); // Public checkout

// --- ADMIN ROUTES ---
// Protected routes for managing the store
router.use(protect); // Apply auth middleware to all routes below

router.post('/products', upload.single('image'), createProduct);
router.put('/products/:id', upload.single('image'), updateProduct);
router.delete('/products/:id', deleteProduct);

router.post('/categories', createCategory);

router.get('/sales', getSales); // Admin needs to see all sales
router.post('/payments', addPayment); // Admin adding manual payments
router.put('/sales/:id/approve', approveSale);
router.put('/sales/:id/reject', rejectSale);

module.exports = router;
