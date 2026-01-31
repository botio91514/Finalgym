import React, { useState, useEffect } from 'react';
import {
    Plus, Edit, Trash, ChevronDown, CheckCircle, AlertCircle,
    ShoppingBag, DollarSign, Store, Tag, Check, X, Clock, Upload, Loader2, RefreshCw
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
    getProducts, getCategories, createProduct, updateProduct, deleteProduct,
    getSales, createCategory, addStorePayment, approveSale, rejectSale,
    Product, ProductCategory, StoreSale
} from '../utils/storeApi';

const StoreManagement: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'inventory' | 'sales'>('inventory');

    // State
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<ProductCategory[]>([]);
    const [sales, setSales] = useState<StoreSale[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>('');

    // Modal State
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    // Add Payment Modal State
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedSaleForPayment, setSelectedSaleForPayment] = useState<StoreSale | null>(null);
    const [addPaymentAmount, setAddPaymentAmount] = useState('');

    // Confirmation Modal State
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [confirmConfig, setConfirmConfig] = useState<{
        title: string;
        message: string;
        onConfirm: () => void;
        variant: 'danger' | 'warning' | 'info';
    } | null>(null);

    // Form State
    const [formData, setFormData] = useState<{
        name: string;
        category: string;
        price: string;
        discount: string;
        stockQuantity: string;
        minStockAlert: string;
        description: string;
        image: string;
        status: 'active' | 'inactive';
    }>({
        name: '',
        category: '',
        price: '',
        discount: '0',
        stockQuantity: '',
        minStockAlert: '5',
        description: '',
        image: '',
        status: 'active'
    });

    const [newCategoryName, setNewCategoryName] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [prodData, catData, salesData] = await Promise.all([
                getProducts(),
                getCategories(),
                getSales()
            ]);
            setProducts(prodData);
            setCategories(catData);
            setSales(salesData);
        } catch (error) {
            toast.error('Failed to load store data');
        } finally {
            setLoading(false);
        }
    };

    // Filter products based on selected category
    const filteredProducts = selectedCategory
        ? products.filter(p => {
            const catId = typeof p.category === 'object' ? p.category._id : p.category;
            return catId === selectedCategory;
        })
        : products;

    const toggleCategoryFilter = (catId: string) => {
        setSelectedCategory(prev => prev === catId ? null : catId);
    };

    const handleProductSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            let payload: any;

            if (imageFile) {
                const formDataToSubmit = new FormData();
                Object.keys(formData).forEach(key => {
                    const value = (formData as any)[key];
                    if (key !== 'image') {
                        formDataToSubmit.append(key, value);
                    }
                });
                formDataToSubmit.append('image', imageFile);
                payload = formDataToSubmit;
            } else {
                payload = {
                    ...formData,
                    price: Number(formData.price),
                    discount: Number(formData.discount),
                    stockQuantity: Number(formData.stockQuantity),
                    minStockAlert: Number(formData.minStockAlert)
                };
            }

            if (editingProduct) {
                await updateProduct(editingProduct._id, payload);
                toast.success('Product updated successfully');
            } else {
                await createProduct(payload);
                toast.success('Product created successfully');
            }
            setIsProductModalOpen(false);
            setEditingProduct(null);
            resetForm();
            fetchData();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteProduct = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;
        try {
            await deleteProduct(id);
            toast.success('Product deleted');
            fetchData();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const handleAddCategory = async () => {
        if (!newCategoryName.trim()) return;
        try {
            setIsSubmitting(true);
            await createCategory({ name: newCategoryName });
            toast.success('Category added');
            setNewCategoryName('');
            const catData = await getCategories();
            setCategories(catData);
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleApproveSale = async (id: string) => {
        const sale = sales.find(s => s._id === id);
        if (sale && sale.paymentStatus !== 'paid') {
            toast.error(`Cannot approve until full payment is achieved. Balance: ₹${sale.balanceAmount}`);
            return;
        }

        try {
            setIsSubmitting(true);
            await approveSale(id);
            toast.success('Sale approved');
            fetchData();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRejectSale = (id: string) => {
        setConfirmConfig({
            title: 'Reject Sale',
            message: 'Are you sure you want to reject and cancel this sale? Stock will be restored.',
            variant: 'danger',
            onConfirm: async () => {
                try {
                    setIsSubmitting(true);
                    await rejectSale(id);
                    toast.success('Sale rejected & cancelled');
                    fetchData();
                    setIsConfirmModalOpen(false);
                } catch (error: any) {
                    toast.error(error.message);
                } finally {
                    setIsSubmitting(false);
                }
            }
        });
        setIsConfirmModalOpen(true);
    };

    const handleAddPaymentClick = (sale: StoreSale) => {
        setSelectedSaleForPayment(sale);
        setAddPaymentAmount(String(sale.balanceAmount));
        setIsPaymentModalOpen(true);
    };

    const handlePaymentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSaleForPayment || !addPaymentAmount) return;

        try {
            setIsSubmitting(true);
            await addStorePayment({
                saleId: selectedSaleForPayment._id,
                amount: Number(addPaymentAmount),
                paymentMode: 'cash'
            });
            toast.success('Payment added & Customer notified');
            fetchData();
            setIsPaymentModalOpen(false);
            setSelectedSaleForPayment(null);
            setAddPaymentAmount('');
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const openEditModal = (product: Product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            category: typeof product.category === 'object' ? product.category._id : product.category,
            price: String(product.price),
            discount: String(product.discount || 0),
            stockQuantity: String(product.stockQuantity),
            minStockAlert: String(product.minStockAlert),
            description: product.description || '',
            image: product.image || '',
            status: product.status
        });
        setImageFile(null);
        setPreviewUrl(product.image || '');
        setIsProductModalOpen(true);
    };

    const resetForm = () => {
        setFormData({
            name: '',
            category: categories.length > 0 ? categories[0]._id : '',
            price: '',
            discount: '0',
            stockQuantity: '',
            minStockAlert: '5',
            description: '',
            image: '',
            status: 'active'
        });
        setImageFile(null);
        setPreviewUrl('');
    };

    const openCreateModal = () => {
        setEditingProduct(null);
        resetForm();
        setIsProductModalOpen(true);
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
        </div>
    );

    return (
        <div className="space-y-8 animate-fadeIn">
            {/* Elegant Header */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 -mr-4 -mt-4 opacity-[0.03]">
                    <ShoppingBag className="w-64 h-64 text-slate-900" />
                </div>

                <div className="relative z-10">
                    <h2 className="text-3xl font-bold flex items-center gap-3 text-slate-900">
                        <div className="bg-yellow-50 p-2 rounded-xl border border-yellow-100">
                            <Store className="text-yellow-600 w-8 h-8" />
                        </div>
                        Store Management
                    </h2>
                    <p className="text-slate-500 mt-2 text-lg">Manage inventory, track sales, and grow your business.</p>
                </div>

                <div className="flex items-center gap-3 relative z-10">
                    <div className="flex bg-gray-50 p-1.5 rounded-xl border border-gray-200">
                        <button
                            onClick={() => setActiveTab('inventory')}
                            className={`px-6 py-2.5 rounded-lg font-bold transition-all duration-300 ${activeTab === 'inventory'
                                ? 'bg-white text-slate-900 shadow-md ring-1 ring-black/5 scale-100'
                                : 'text-slate-500 hover:text-slate-700 hover:bg-gray-200/50'}`}
                        >
                            Inventory
                        </button>
                        <button
                            onClick={() => setActiveTab('sales')}
                            className={`px-6 py-2.5 rounded-lg font-bold transition-all duration-300 ${activeTab === 'sales'
                                ? 'bg-white text-slate-900 shadow-md ring-1 ring-black/5 scale-100'
                                : 'text-slate-500 hover:text-slate-700 hover:bg-gray-200/50'}`}
                        >
                            Sales History
                        </button>
                    </div>

                    <button
                        onClick={fetchData}
                        disabled={loading}
                        className="p-3 bg-white border border-gray-200 text-slate-600 rounded-xl hover:bg-gray-50 hover:text-yellow-600 transition-all shadow-sm active:scale-95 disabled:opacity-50"
                        title="Refresh Data"
                    >
                        <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {activeTab === 'inventory' && (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                    {/* Category & Actions Bar */}
                    <div className="p-6 border-b border-gray-100 space-y-6">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <h3 className="font-bold text-xl text-gray-900">Products Inventory</h3>
                                <p className="text-sm text-gray-500 mt-1">Manage pricing, stock, and categories.</p>
                            </div>
                            <button
                                onClick={openCreateModal}
                                className="bg-yellow-500 text-slate-900 px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-yellow-400 hover:scale-105 transition-all shadow-md active:scale-95"
                            >
                                <Plus size={20} /> Add Product
                            </button>
                        </div>

                        {/* Category Management */}
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">
                            <div className="flex-1 flex flex-wrap gap-2 items-center">
                                <span className="text-sm font-semibold text-slate-700 mr-2 flex items-center gap-2">
                                    <Tag size={16} /> Categories:
                                </span>
                                {categories.map((cat) => (
                                    <button
                                        key={cat._id}
                                        onClick={() => toggleCategoryFilter(cat._id)}
                                        className={`px-3 py-1 rounded-full text-sm font-medium shadow-sm flex items-center gap-1 transition-all
                                            ${selectedCategory === cat._id
                                                ? 'bg-yellow-500 text-slate-900 border border-yellow-600 ring-2 ring-yellow-200'
                                                : 'bg-white border border-gray-200 text-slate-700 hover:border-yellow-400 hover:text-yellow-700'
                                            }`}
                                    >
                                        {cat.name}
                                    </button>
                                ))}
                                {selectedCategory && (
                                    <button
                                        onClick={() => setSelectedCategory(null)}
                                        className="text-xs text-gray-500 hover:text-red-500 underline ml-2"
                                    >
                                        Clear Filter
                                    </button>
                                )}
                            </div>

                            <div className="flex items-center gap-2 w-full md:w-auto">
                                <div className="relative flex-1 md:w-64">
                                    <input
                                        type="text"
                                        placeholder="New Category Name"
                                        value={newCategoryName}
                                        onChange={(e) => setNewCategoryName(e.target.value)}
                                        className="w-full pl-4 pr-12 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all shadow-sm"
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                                    />
                                    <button
                                        onClick={handleAddCategory}
                                        disabled={isSubmitting}
                                        className="absolute right-1 top-1 bottom-1 bg-slate-900 text-white p-1.5 rounded-md hover:bg-slate-800 transition shadow-sm disabled:opacity-50 flex items-center justify-center min-w-[32px]"
                                        title="Add Category"
                                    >
                                        {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Product</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Category</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Price / Discount</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Stock</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredProducts.map((product) => (
                                    <tr key={product._id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200 shrink-0">
                                                    {product.image ? (
                                                        <img src={product.image} className="w-full h-full object-cover" alt={product.name} />
                                                    ) : (
                                                        <ShoppingBag className="w-5 h-5 text-gray-400" />
                                                    )}
                                                </div>
                                                <span className="font-bold text-gray-900">{product.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="bg-gray-100 px-2.5 py-1 rounded-md text-xs font-medium text-gray-600 border border-gray-200">
                                                {typeof product.category === 'object' ? product.category.name : 'Unknown'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-900">
                                                    ₹{product.discount && product.discount > 0
                                                        ? (product.price - (product.price * product.discount / 100)).toLocaleString()
                                                        : product.price.toLocaleString()}
                                                </span>
                                                {product.discount && product.discount > 0 ? (
                                                    <div className="flex items-center gap-2 text-xs">
                                                        <span className="text-gray-400 line-through">₹{product.price.toLocaleString()}</span>
                                                        <span className="text-green-600 font-bold bg-green-50 px-1.5 py-0.5 rounded">{product.discount}% OFF</span>
                                                    </div>
                                                ) : null}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${product.stockQuantity <= product.minStockAlert ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
                                                <span className={`text-sm font-medium ${product.stockQuantity <= product.minStockAlert ? 'text-red-600' : 'text-green-600'}`}>
                                                    {product.stockQuantity}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {product.status === 'active' ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">
                                                    <CheckCircle size={12} /> Active
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-500 border border-gray-200">
                                                    <AlertCircle size={12} /> Inactive
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => openEditModal(product)}
                                                    className="text-slate-400 hover:text-yellow-600 hover:bg-yellow-50 p-2 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteProduct(product._id)}
                                                    className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'sales' && (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                        <h3 className="font-bold text-xl text-gray-800">Sales History</h3>
                        <div className="text-sm text-gray-500">
                            Total Records: <span className="font-bold text-slate-900">{sales.length}</span>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Customer</th>
                                    <th className="px-6 py-4">Items</th>
                                    <th className="px-6 py-4">Financials</th>
                                    <th className="px-6 py-4">Payment</th>
                                    <th className="px-6 py-4">Order</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {sales.map((sale) => (
                                    <tr key={sale._id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 text-gray-500 text-sm">
                                            {new Date(sale.createdAt).toLocaleDateString(undefined, {
                                                year: 'numeric', month: 'short', day: 'numeric',
                                                hour: '2-digit', minute: '2-digit'
                                            })}
                                        </td>
                                        <td className="px-6 py-4">
                                            {sale.member ? (
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-slate-900">{sale.member.name}</span>
                                                    <span className="text-xs text-yellow-600 font-medium">Member</span>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-gray-700">{sale.guestDetails?.name || 'Guest'}</span>
                                                    <span className="text-xs text-gray-400">Guest</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 text-sm max-w-xs truncate">
                                            {sale.items.map(i => `${typeof i.product === 'object' ? i.product.name : 'Item'} (${i.quantity})`).join(', ')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-0.5">
                                                <span className="font-bold text-slate-900">₹{sale.totalAmount.toLocaleString()}</span>
                                                <div className="flex items-center gap-1.5 text-xs">
                                                    <span className="text-green-600 font-medium">Paid: ₹{sale.paidAmount.toLocaleString()}</span>
                                                    {sale.balanceAmount > 0 && (
                                                        <span className="text-red-500 font-bold bg-red-50 px-1 rounded">Bal: ₹{sale.balanceAmount.toLocaleString()}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter border ${sale.paymentStatus === 'paid' ? 'bg-green-50 text-green-700 border-green-200' :
                                                    sale.paymentStatus === 'partial' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                                        'bg-red-50 text-red-700 border-red-200'
                                                    }`}>
                                                    {sale.paymentStatus === 'paid' ? <CheckCircle size={10} /> : <AlertCircle size={10} />}
                                                    {sale.paymentStatus}
                                                </span>
                                                <span className="text-[10px] text-gray-400 capitalize flex items-center gap-1 font-medium">
                                                    Mode: <span className="text-gray-600">{sale.paymentMode || 'cash'}</span>
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${sale.orderStatus === 'confirmed' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                sale.orderStatus === 'cancelled' ? 'bg-gray-100 text-gray-500 border-gray-200' :
                                                    sale.orderStatus === 'completed' ? 'bg-green-50 text-green-700 border-green-200' :
                                                        'bg-orange-50 text-orange-700 border-orange-200'
                                                }`}>
                                                {sale.orderStatus === 'pending' && <Clock size={12} />}
                                                {sale.orderStatus === 'confirmed' && <CheckCircle size={12} />}
                                                {sale.orderStatus === 'cancelled' && <X size={12} />}
                                                {sale.orderStatus.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {sale.orderStatus === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleApproveSale(sale._id)}
                                                            disabled={isSubmitting || sale.paymentStatus !== 'paid'}
                                                            className={`p-1.5 rounded-lg transition shadow-sm border flex items-center justify-center min-w-[34px] ${sale.paymentStatus === 'paid'
                                                                ? 'bg-green-50 text-green-600 border-green-200 hover:bg-green-600 hover:text-white'
                                                                : 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed'
                                                                }`}
                                                            title={sale.paymentStatus === 'paid' ? 'Approve Order' : 'Full payment required to approve'}
                                                        >
                                                            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                                                        </button>
                                                        <button
                                                            onClick={() => handleRejectSale(sale._id)}
                                                            disabled={isSubmitting}
                                                            className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition shadow-sm border border-red-200 disabled:opacity-50 flex items-center justify-center min-w-[34px]"
                                                            title="Reject Order"
                                                        >
                                                            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <X size={16} />}
                                                        </button>
                                                    </>
                                                )}

                                                {sale.paymentStatus !== 'paid' && sale.orderStatus !== 'cancelled' && (
                                                    <button
                                                        onClick={() => handleAddPaymentClick(sale)}
                                                        disabled={isSubmitting}
                                                        className="px-3 py-1 bg-yellow-400 text-slate-900 rounded-lg text-[10px] font-black uppercase flex items-center gap-1 hover:bg-yellow-500 transition shadow-sm disabled:opacity-50 min-w-[100px] justify-center"
                                                    >
                                                        {isSubmitting ? <Loader2 size={12} className="animate-spin" /> : <><DollarSign size={12} /> Add Payment</>}
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Premium Product Modal */}
            {isProductModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-gray-100 overflow-hidden animate-slideUp">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="font-bold text-xl text-slate-900">{editingProduct ? 'Edit Product' : 'New Product'}</h3>
                            <button onClick={() => setIsProductModalOpen(false)} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1 transition"><ChevronDown className="rotate-180" /></button>
                        </div>
                        <form onSubmit={handleProductSubmit} className="p-8 space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Product Name</label>
                                <input
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all hover:border-gray-400"
                                    placeholder="e.g. Whey Protein"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Category</label>
                                    <div className="relative">
                                        <select
                                            required
                                            value={formData.category}
                                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                                            className="w-full appearance-none border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all hover:border-gray-400 bg-white"
                                        >
                                            <option value="">Select Category</option>
                                            {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Price (₹)</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2.5 text-gray-400 font-bold">₹</span>
                                        <input
                                            required type="number" min="0"
                                            value={formData.price}
                                            onChange={e => setFormData({ ...formData, price: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg pl-8 pr-4 py-2.5 focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all hover:border-gray-400"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Discount (%)</label>
                                    <div className="relative">
                                        <span className="absolute right-4 top-2.5 text-gray-400 font-bold">%</span>
                                        <input
                                            type="number" min="0" max="100"
                                            value={formData.discount}
                                            onChange={e => setFormData({ ...formData, discount: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all hover:border-gray-400"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Stock Quantity</label>
                                    <input
                                        required type="number" min="0"
                                        value={formData.stockQuantity}
                                        onChange={e => setFormData({ ...formData, stockQuantity: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all hover:border-gray-400"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Min Alert Limit</label>
                                    <input
                                        type="number" min="0"
                                        value={formData.minStockAlert}
                                        onChange={e => setFormData({ ...formData, minStockAlert: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all hover:border-gray-400"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Product Image</label>
                                <div className="flex items-center gap-4">
                                    <div className="relative group">
                                        <div className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50 group-hover:border-yellow-500 transition-colors">
                                            {previewUrl ? (
                                                <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
                                            ) : (
                                                <ShoppingBag className="w-8 h-8 text-gray-300" />
                                            )}
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                                                <Upload className="text-white w-6 h-6" />
                                            </div>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs text-gray-500 mb-2">Upload a professional photo (JPG, PNG). Max 5MB.</p>
                                        <button
                                            type="button"
                                            onClick={() => document.getElementById('product-image-upload')?.click()}
                                            className="text-sm font-bold text-yellow-600 hover:text-yellow-700 flex items-center gap-1"
                                        >
                                            <Upload size={14} /> {imageFile ? 'Change Photo' : 'Choose Photo'}
                                        </button>
                                        <input
                                            id="product-image-upload"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />
                                    </div>
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-yellow-500 text-slate-900 font-bold py-3 rounded-xl hover:bg-yellow-400 transition-all transform hover:scale-[1.01] shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        {editingProduct ? 'Updating...' : 'Adding Product...'}
                                    </>
                                ) : (
                                    editingProduct ? 'Update Product' : 'Create Product'
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}
            {/* Confirmation Modal */}
            {isConfirmModalOpen && confirmConfig && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-gray-100 overflow-hidden animate-slideUp">
                        <div className="p-6 text-center">
                            <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${confirmConfig.variant === 'danger' ? 'bg-red-50 text-red-600' :
                                confirmConfig.variant === 'warning' ? 'bg-yellow-50 text-yellow-600' : 'bg-blue-50 text-blue-600'
                                }`}>
                                {confirmConfig.variant === 'danger' ? <Trash size={32} /> : <AlertCircle size={32} />}
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">{confirmConfig.title}</h3>
                            <p className="text-gray-500 mb-8">{confirmConfig.message}</p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setIsConfirmModalOpen(false)}
                                    className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmConfig.onConfirm}
                                    disabled={isSubmitting}
                                    className={`flex-1 px-4 py-2.5 text-white font-bold rounded-xl transition shadow-lg flex items-center justify-center gap-2 ${confirmConfig.variant === 'danger' ? 'bg-red-600 hover:bg-red-700' :
                                        confirmConfig.variant === 'warning' ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-blue-600 hover:bg-blue-700'
                                        }`}
                                >
                                    {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : 'Confirm'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Payment Modal */}
            {isPaymentModalOpen && selectedSaleForPayment && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-gray-100 overflow-hidden animate-slideUp">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="font-bold text-xl text-slate-900">Add Cash Payment</h3>
                            <button onClick={() => setIsPaymentModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                        </div>
                        <form onSubmit={handlePaymentSubmit} className="p-6 space-y-6">
                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-blue-700 font-medium">Customer:</span>
                                    <span className="text-blue-900 font-bold">{selectedSaleForPayment.member?.name || selectedSaleForPayment.guestDetails?.name || 'Guest'}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-blue-700 font-medium">Remaining Balance:</span>
                                    <span className="text-blue-900 font-bold">₹{selectedSaleForPayment.balanceAmount.toLocaleString()}</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Amount to Pay (INR)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        max={selectedSaleForPayment.balanceAmount}
                                        value={addPaymentAmount}
                                        onChange={e => setAddPaymentAmount(e.target.value)}
                                        className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 outline-none font-bold text-lg"
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={isSubmitting || !addPaymentAmount}
                                className="w-full bg-yellow-500 text-slate-900 font-bold py-3 rounded-xl hover:bg-yellow-400 transition shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <><DollarSign size={18} /> Confirm Payment</>}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StoreManagement;
