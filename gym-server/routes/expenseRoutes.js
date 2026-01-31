const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
const { protect } = require('../middleware/auth');

router.use(protect); // Protect all expense routes

router.route('/')
    .get(expenseController.getExpenses)
    .post(expenseController.addExpense);

router.route('/:id')
    .delete(expenseController.deleteExpense);

module.exports = router;
