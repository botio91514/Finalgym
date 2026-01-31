const express = require('express');
const router = express.Router();
const {
    submitContactForm,
    getInquiries,
    updateInquiryStatus,
    deleteInquiry
} = require('../controllers/contactController');
const { protect } = require('../middleware/auth');

// Public route to submit contact form
router.post('/', submitContactForm);

// Protected routes (Admin only)
router.use(protect);
router.get('/', getInquiries);
router.put('/:id', updateInquiryStatus);
router.delete('/:id', deleteInquiry);

module.exports = router;
