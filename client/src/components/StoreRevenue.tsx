import React, { useState, useEffect } from 'react';
import {
    PieChart, TrendingUp, Banknote, Package, Tag, Loader2, CreditCard
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
    getSales, getCategories, getProducts,
    StoreSale, ProductCategory, Product
} from '../utils/storeApi';

const StoreRevenue: React.FC = () => {
    const [sales, setSales] = useState<StoreSale[]>([]);
    const [categories, setCategories] = useState<ProductCategory[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [salesData, catData, prodData] = await Promise.all([
                getSales(),
                getCategories(),
                getProducts(true)
            ]);
            setSales(salesData);
            setCategories(catData);
            setProducts(prodData);
        } catch (error) {
            toast.error('Failed to load store revenue data');
        } finally {
            setLoading(false);
        }
    };

    // Filter confirmed/paid sales for the selected period
    const filteredSales = sales.filter(sale => {
        const d = new Date(sale.createdAt);
        return d.getFullYear() === selectedYear &&
            d.getMonth() === selectedMonth &&
            (sale.paymentStatus === 'paid' || sale.paymentStatus === 'partial');
    });

    const totalRevenue = filteredSales.reduce((sum, s) => sum + s.paidAmount, 0);
    const cashRevenue = filteredSales.filter(s => s.paymentMode === 'cash').reduce((sum, s) => sum + s.paidAmount, 0);
    const onlineRevenue = filteredSales.filter(s => s.paymentMode === 'online').reduce((sum, s) => sum + s.paidAmount, 0);

    // Calculate revenue by category
    const categoryRevenue = categories.map(cat => {
        let revenue = 0;
        filteredSales.forEach(sale => {
            sale.items.forEach(item => {
                const productId = typeof item.product === 'object' ? item.product._id : item.product;
                const product = products.find(p => p._id === productId);

                let actualCatId = '';
                if (product) {
                    actualCatId = typeof product.category === 'object' ? product.category._id : product.category;
                } else if (item.categoryId) {
                    actualCatId = item.categoryId;
                }

                if (actualCatId === cat._id) {
                    // Approximate revenue for this item in this sale
                    const itemTotal = item.priceAtSale * item.quantity;
                    const share = sale.totalAmount > 0 ? (itemTotal / sale.totalAmount) : 0;
                    revenue += sale.paidAmount * share;
                }
            });
        });
        return { name: cat.name, revenue };
    }).sort((a, b) => b.revenue - a.revenue);

    // Calculate top products
    const productStats = products.map(prod => {
        let soldCount = 0;
        let revenue = 0;
        filteredSales.forEach(sale => {
            sale.items.forEach(item => {
                const productId = typeof item.product === 'object' ? item.product._id : item.product;
                if (productId === prod._id) {
                    soldCount += item.quantity;
                    const itemTotal = item.priceAtSale * item.quantity;
                    const share = sale.totalAmount > 0 ? (itemTotal / sale.totalAmount) : 0;
                    revenue += sale.paidAmount * share;
                }
            });
        });
        return { ...prod, soldCount, revenue };
    }).filter(p => p.soldCount > 0).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Store Revenue Analytics</h2>
                    <p className="text-slate-500">Track your product sales and performance</p>
                </div>

                <div className="flex gap-2">
                    <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                        className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                        {Array.from({ length: 12 }).map((_, i) => (
                            <option key={i} value={i}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
                        ))}
                    </select>
                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                        className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                        {[2024, 2025, 2026].map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-blue-50 rounded-xl">
                            <TrendingUp className="w-6 h-6 text-blue-600" />
                        </div>
                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">TOTAL</span>
                    </div>
                    <h3 className="text-slate-500 text-sm font-medium">Total Monthly Revenue</h3>
                    <div className="flex items-baseline gap-2 mt-1">
                        <p className="text-3xl font-bold text-slate-900">{formatCurrency(totalRevenue)}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-emerald-50 rounded-xl">
                            <Banknote className="w-6 h-6 text-emerald-600" />
                        </div>
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">CASH</span>
                    </div>
                    <h3 className="text-slate-500 text-sm font-medium">Cash Collections</h3>
                    <p className="text-3xl font-bold text-slate-900 mt-1">{formatCurrency(cashRevenue)}</p>
                    <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5">
                        <div
                            className="bg-emerald-500 h-1.5 rounded-full"
                            style={{ width: `${totalRevenue > 0 ? (cashRevenue / totalRevenue) * 100 : 0}%` }}
                        ></div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-indigo-50 rounded-xl">
                            <CreditCard className="w-6 h-6 text-indigo-600" />
                        </div>
                        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">ONLINE</span>
                    </div>
                    <h3 className="text-slate-500 text-sm font-medium">Online Payments</h3>
                    <p className="text-3xl font-bold text-slate-900 mt-1">{formatCurrency(onlineRevenue)}</p>
                    <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5">
                        <div
                            className="bg-indigo-500 h-1.5 rounded-full"
                            style={{ width: `${totalRevenue > 0 ? (onlineRevenue / totalRevenue) * 100 : 0}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Category Revenue */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <PieChart className="w-5 h-5 text-blue-500" />
                            Revenue by Category
                        </h3>
                    </div>
                    <div className="space-y-6">
                        {categoryRevenue.length > 0 ? categoryRevenue.map((cat, idx) => (
                            <div key={cat.name}>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-semibold text-slate-700">{cat.name}</span>
                                    <span className="text-sm font-bold text-slate-900">{formatCurrency(cat.revenue)}</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-2.5">
                                    <div
                                        className={`h-2.5 rounded-full ${idx === 0 ? 'bg-blue-500' : idx === 1 ? 'bg-indigo-500' : 'bg-slate-400'}`}
                                        style={{ width: `${totalRevenue > 0 ? (cat.revenue / totalRevenue) * 100 : 0}%` }}
                                    ></div>
                                </div>
                                <p className="text-right text-[10px] text-slate-400 mt-1 font-medium">
                                    {totalRevenue > 0 ? ((cat.revenue / totalRevenue) * 100).toFixed(1) : 0}% of store revenue
                                </p>
                            </div>
                        )) : (
                            <div className="text-center py-10 text-slate-400">No category data available for this period</div>
                        )}
                    </div>
                </div>

                {/* Top Products */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <Package className="w-5 h-5 text-orange-500" />
                            Top Selling Products
                        </h3>
                    </div>
                    <div className="space-y-4">
                        {productStats.length > 0 ? productStats.map((prod, idx) => (
                            <div key={prod._id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-sm">
                                    #{idx + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-bold text-slate-800 truncate">{prod.name}</h4>
                                    <div className="flex items-center gap-2">
                                        <Tag className="w-3 h-3 text-slate-400" />
                                        <span className="text-xs text-slate-500 font-medium">
                                            {typeof prod.category === 'object' ? prod.category.name : 'Uncategorized'}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-slate-900">{formatCurrency(prod.revenue)}</p>
                                    <p className="text-xs text-emerald-600 font-bold">{prod.soldCount} sold</p>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-10 text-slate-400">No product sales data available for this period</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Recent Sales Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-50">
                    <h3 className="text-lg font-bold text-slate-800">Recent Transactions</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Customer</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Payment</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredSales.slice(0, 10).map((sale) => (
                                <tr key={sale._id} className="hover:bg-slate-50/30 transition-colors">
                                    <td className="px-6 py-4 text-sm text-slate-600">
                                        {new Date(sale.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-bold text-slate-800">
                                            {sale.member?.name || sale.guestDetails?.name || 'Guest'}
                                        </p>
                                        <p className="text-xs text-slate-400">
                                            {sale.paymentMode.toUpperCase()}
                                        </p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-[10px] font-bold rounded-full ${sale.paymentStatus === 'paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                                            }`}>
                                            {sale.paymentStatus.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-bold text-slate-900 text-right">
                                        {formatCurrency(sale.paidAmount)}
                                    </td>
                                </tr>
                            ))}
                            {filteredSales.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-10 text-center text-slate-400">No transactions for this month</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default StoreRevenue;
