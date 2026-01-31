const Expense = require('../models/Expense');

// @desc    Add a new expense
// @route   POST /api/expenses
// @access  Private
exports.addExpense = async (req, res) => {
    try {
        const { title, amount, category, date, paymentMethod, description } = req.body;

        const expense = await Expense.create({
            title,
            amount,
            category,
            date,
            paymentMethod,
            description
        });

        res.status(201).json({
            status: 'success',
            data: {
                expense
            }
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

// @desc    Get all expenses (can filter by month and year)
// @route   GET /api/expenses
// @access  Private
exports.getExpenses = async (req, res) => {
    try {
        const { month, year } = req.query;
        let query = {};

        if (month && year) {
            // Javascript months are 0-indexed (0 = Jan, 11 = Dec)
            // If user passes month=1 (Feb), we want start of Feb to start of Mar
            const startDate = new Date(year, month, 1);
            const endDate = new Date(year, parseInt(month) + 1, 0, 23, 59, 59); // Last day of month

            query.date = {
                $gte: startDate,
                $lte: endDate
            };
        } else if (year) {
            const startDate = new Date(year, 0, 1);
            const endDate = new Date(year, 12, 0, 23, 59, 59);
            query.date = {
                $gte: startDate,
                $lte: endDate
            };
        }

        const expenses = await Expense.find(query).sort({ date: -1 });

        res.status(200).json({
            status: 'success',
            results: expenses.length,
            data: {
                expenses
            }
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

// @desc    Delete an expense
// @route   DELETE /api/expenses/:id
// @access  Private
exports.deleteExpense = async (req, res) => {
    try {
        await Expense.findByIdAndDelete(req.params.id);

        res.status(200).json({
            status: 'success',
            data: null
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};
