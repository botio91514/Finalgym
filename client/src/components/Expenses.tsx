import React, { useState, useEffect } from 'react';
import { Plus, Trash2, TrendingUp, TrendingDown, DollarSign, Filter, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Expense, getExpenses, addExpense, deleteExpense } from '../utils/apiClient';

interface ExpensesProps {
    getRevenue: (month: number, year: number) => number;
}

const Expenses: React.FC<ExpensesProps> = ({ getRevenue }) => {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Filter state
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    // Calculate revenue for selected period
    const monthlyRevenue = getRevenue(selectedMonth, selectedYear);

    const categories = ['Rent', 'Utilities', 'Salaries', 'Maintenance', 'Equipment', 'Marketing', 'Other'];

    const [newExpense, setNewExpense] = useState<Partial<Expense>>({
        title: '',
        amount: 0,
        category: 'Other',
        date: new Date().toISOString().slice(0, 10),
        paymentMethod: 'Cash',
        description: ''
    });

    const fetchExpenses = async () => {
        try {
            setIsLoading(true);
            const data = await getExpenses(selectedMonth, selectedYear);
            setExpenses(data);
        } catch (error) {
            console.error('Failed to fetch expenses', error);
            toast.error('Failed to load expenses');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchExpenses();
    }, [selectedMonth, selectedYear]);

    const handleAddExpense = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newExpense.title || !newExpense.amount) {
            toast.error('Please fill in required fields');
            return;
        }

        try {
            setIsSubmitting(true);
            await addExpense({
                ...newExpense as Expense,
                amount: Number(newExpense.amount) // Ensure number
            });

            toast.success('Expense added successfully');
            setShowAddModal(false);
            setNewExpense({
                title: '',
                amount: 0,
                category: 'Other',
                date: new Date().toISOString().slice(0, 10),
                paymentMethod: 'Cash',
                description: ''
            });
            fetchExpenses(); // Refresh list
        } catch (error) {
            toast.error('Failed to add expense');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteExpense = async (id: string) => {
        if (!confirm('Are you sure you want to delete this expense?')) return;

        try {
            await deleteExpense(id);
            toast.success('Expense deleted');
            setExpenses(expenses.filter(e => e._id !== id));
        } catch (error) {
            toast.error('Failed to delete expense');
        }
    };

    // Calculations
    const totalExpenses = expenses.reduce((sum, item) => sum + (item.amount || 0), 0);
    const netProfit = monthlyRevenue - totalExpenses;
    const isProfit = netProfit >= 0;

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Expense & Profit Tracking</h2>
                    <p className="text-gray-500">Manage your gym's financial health</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center space-x-2 bg-white p-2 rounded-lg shadow-sm border border-gray-200">
                        <Filter className="w-4 h-4 text-gray-500" />
                        <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(Number(e.target.value))}
                            className="border-none bg-transparent text-sm focus:ring-0 cursor-pointer outline-none"
                        >
                            {months.map((month, idx) => (
                                <option key={month} value={idx}>{month}</option>
                            ))}
                        </select>
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(Number(e.target.value))}
                            className="border-none bg-transparent text-sm focus:ring-0 cursor-pointer outline-none"
                        >
                            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    </div>

                    <button
                        onClick={fetchExpenses}
                        disabled={isLoading}
                        className="p-2.5 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 hover:text-red-600 transition-all shadow-sm active:scale-95 disabled:opacity-50"
                        title="Refresh Expenses"
                    >
                        <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* Financial Health Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Revenue */}
                <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Revenue ({months[selectedMonth]})</p>
                            <h3 className="text-2xl font-bold text-gray-800 mt-1">
                                ₹{monthlyRevenue.toLocaleString()}
                            </h3>
                        </div>
                        <div className="p-2 bg-green-50 rounded-lg">
                            <TrendingUp className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>

                {/* Expenses */}
                <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-500">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Expenses ({months[selectedMonth]})</p>
                            <h3 className="text-2xl font-bold text-gray-800 mt-1">
                                ₹{totalExpenses.toLocaleString()}
                            </h3>
                        </div>
                        <div className="p-2 bg-red-50 rounded-lg">
                            <TrendingDown className="w-6 h-6 text-red-600" />
                        </div>
                    </div>
                </div>

                {/* Net Profit */}
                <div className={`bg-white rounded-xl shadow-md p-6 border-l-4 ${isProfit ? 'border-blue-500' : 'border-orange-500'}`}>
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Net Profit</p>
                            <h3 className={`text-2xl font-bold mt-1 ${isProfit ? 'text-blue-600' : 'text-orange-600'}`}>
                                {isProfit ? '+' : ''}₹{netProfit.toLocaleString()}
                            </h3>
                        </div>
                        <div className={`p-2 rounded-lg ${isProfit ? 'bg-blue-50' : 'bg-orange-50'}`}>
                            <DollarSign className={`w-6 h-6 ${isProfit ? 'text-blue-600' : 'text-orange-600'}`} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Expenses List */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-800">Expense History</h3>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Add Expense</span>
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Expense Item</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Method</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                        Loading expenses...
                                    </td>
                                </tr>
                            ) : expenses.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                        No expenses recorded for this month.
                                    </td>
                                </tr>
                            ) : (
                                expenses.map((expense) => (
                                    <tr key={expense._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(expense.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900">{expense.title}</div>
                                            {expense.description && <div className="text-xs text-gray-400">{expense.description}</div>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                {expense.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-gray-900">
                                            ₹{expense.amount.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {expense.paymentMethod}
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => handleDeleteExpense(expense._id!)}
                                                className="text-red-400 hover:text-red-600 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Expense Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-slideIn">
                        <div className="px-6 py-4 bg-gray-50 border-b flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-800">Add New Expense</h3>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleAddExpense} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Expense Title</label>
                                <input
                                    type="text"
                                    required
                                    value={newExpense.title}
                                    onChange={(e) => setNewExpense({ ...newExpense, title: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-all"
                                    placeholder="e.g. Electricity Bill"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        value={newExpense.amount}
                                        onChange={(e) => setNewExpense({ ...newExpense, amount: Number(e.target.value) })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-all"
                                        placeholder="0.00"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                    <select
                                        value={newExpense.category}
                                        onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value as any })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-all"
                                    >
                                        {categories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={newExpense.date}
                                        onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                                    <select
                                        value={newExpense.paymentMethod}
                                        onChange={(e) => setNewExpense({ ...newExpense, paymentMethod: e.target.value as any })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-all"
                                    >
                                        <option value="Cash">Cash</option>
                                        <option value="Online">Online</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                                <textarea
                                    rows={2}
                                    value={newExpense.description}
                                    onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-all"
                                    placeholder="Additional details..."
                                />
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 rounded-lg transition-colors flex justify-center items-center"
                                >
                                    {isSubmitting ? 'Saving...' : 'Save Expense'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Expenses;
