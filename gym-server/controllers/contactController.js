const Contact = require('../models/Contact');
const { sendEmail, createContactAdminEmail, createContactUserEmail } = require('../services/emailService');

// @desc    Submit contact form
// @route   POST /api/contact
// @access  Public
exports.submitContactForm = async (req, res) => {
    try {
        const { name, email, phone, subject, message } = req.body;

        // Create contact record
        const contact = await Contact.create({
            name,
            email,
            phone,
            subject,
            message
        });

        // 1. Send Email to Admin
        try {
            await sendEmail({
                email: process.env.EMAIL_USER, // Admin Email
                subject: `New Contact Inquiry: ${subject}`,
                html: createContactAdminEmail(contact)
            });
        } catch (adminMailError) {
            console.error('Failed to send admin contact notification:', adminMailError);
        }

        // 2. Send Email to User (Thank you)
        try {
            await sendEmail({
                email: email,
                subject: 'Thank you for contacting Star Gym!',
                html: createContactUserEmail(name)
            });
        } catch (userMailError) {
            console.error('Failed to send user contact confirmation:', userMailError);
        }

        res.status(201).json({
            success: true,
            data: contact,
            message: 'Your inquiry has been submitted successfully'
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// @desc    Get all contact inquiries
// @route   GET /api/contact
// @access  Private (Admin)
exports.getInquiries = async (req, res) => {
    try {
        const inquiries = await Contact.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            data: inquiries
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// @desc    Update inquiry status (read/replied)
// @route   PUT /api/contact/:id
// @access  Private (Admin)
exports.updateInquiryStatus = async (req, res) => {
    try {
        const contact = await Contact.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!contact) {
            return res.status(404).json({
                success: false,
                error: 'Inquiry not found'
            });
        }

        res.status(200).json({
            success: true,
            data: contact
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// @desc    Delete an inquiry
// @route   DELETE /api/contact/:id
// @access  Private (Admin)
exports.deleteInquiry = async (req, res) => {
    try {
        const contact = await Contact.findByIdAndDelete(req.params.id);

        if (!contact) {
            return res.status(404).json({
                success: false,
                error: 'Inquiry not found'
            });
        }

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};
