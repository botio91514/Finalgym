import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, Search, X, Loader2, QrCode, CheckCircle2, ShoppingBag, Banknote } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { API_BASE_URL } from '../App';
import { getProducts, getCategories, createSale, Product, ProductCategory } from '../utils/storeApi';
import gpayQR from '../assets/gpay.jpeg';
import Footer from './Footer';

const StorePage: React.FC = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<ProductCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState<string>('All');
    const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Offer Popup State
    const [showOfferPopup, setShowOfferPopup] = useState(false);
    const [offerProduct, setOfferProduct] = useState<Product | null>(null);

    // Checkout State
    const [customerEmail, setCustomerEmail] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [paymentMode, setPaymentMode] = useState<'online' | 'cash'>('online');
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [prodData, catData] = await Promise.all([getProducts(), getCategories()]);
            setProducts(prodData);
            setCategories(catData);

            // Check for offers
            const discountedProducts = prodData.filter(p => (p.discount || 0) > 0 && p.stockQuantity > 0);
            if (discountedProducts.length > 0) {
                // Find highest discount
                const bestOffer = discountedProducts.reduce((prev, current) =>
                    (prev.discount || 0) > (current.discount || 0) ? prev : current
                );

                // transform session storage check to local component for now to ensure it works directly
                const hasSeen = sessionStorage.getItem('hasSeenOffer');
                if (!hasSeen) {
                    setOfferProduct(bestOffer);
                    setShowOfferPopup(true);
                    sessionStorage.setItem('hasSeenOffer', 'true');
                }
            }
        } catch (error: any) {
            toast.error('Failed to load store data');
        } finally {
            setLoading(false);
        }
    };

    const addToCart = (product: Product) => {
        setCart(prev => {
            const existing = prev.find(item => item.product._id === product._id);
            if (existing) {
                if (existing.quantity >= product.stockQuantity) {
                    toast.error('Max stock reached');
                    return prev;
                }
                return prev.map(item =>
                    item.product._id === product._id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, { product, quantity: 1 }];
        });
        toast.success('Added to cart');
    };

    const updateQuantity = (productId: string, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.product._id === productId) {
                const newQty = item.quantity + delta;
                if (newQty > item.product.stockQuantity) {
                    toast.error('Max stock reached');
                    return item;
                }
                return { ...item, quantity: Math.max(0, newQty) };
            }
            return item;
        }).filter(item => item.quantity > 0));
    };

    const calculateItemPrice = (product: Product) => {
        if (product.discount && product.discount > 0) {
            return product.price - (product.price * product.discount / 100);
        }
        return product.price;
    };

    const cartTotal = cart.reduce((sum, item) => sum + (calculateItemPrice(item.product) * item.quantity), 0);
    const originalTotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const totalSavings = originalTotal - cartTotal;

    const handleCheckout = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!customerPhone && !customerEmail) {
            toast.error('Please provide Email or Phone');
            return;
        }

        try {
            setIsProcessing(true);

            const payload = {
                items: cart.map(item => ({
                    productId: item.product._id,
                    quantity: item.quantity
                })),
                customerEmail,
                customerName,
                customerPhone,
                paymentMode,
                paidAmount: 0 // Payment is recorded via Payment system if online
            };

            const saleResponse = await createSale(payload);
            const saleId = saleResponse._id;

            // If online payment, create payment record and redirect
            if (paymentMode === 'online' && saleId) {
                try {
                    const paymentResponse = await fetch(`${API_BASE_URL}/api/payments/create-store`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            saleId: saleId,
                            amount: cartTotal,
                            customerName: customerName || 'Store Customer'
                        }),
                    });

                    const paymentData = await paymentResponse.json();

                    if (!paymentResponse.ok || paymentData.status !== 'success') {
                        throw new Error(paymentData.message || 'Failed to create payment');
                    }

                    // Store payment data in localStorage for the payment page
                    localStorage.setItem(`payment_${paymentData.data.orderId}`, JSON.stringify(paymentData.data));

                    toast.success('Order created! Please complete your payment.');
                    setCart([]);
                    setIsCheckoutOpen(false);
                    navigate(`/payment/${paymentData.data.orderId}`);
                    return;
                } catch (paymentError: any) {
                    console.error('Error creating store payment:', paymentError);
                    toast.error('Order created but payment setup failed. Please contact admin.');
                    // Still show success page or similar
                }
            }

            toast.success('Order placed successfully!');
            setCart([]);
            setIsCheckoutOpen(false);
            setIsCartOpen(false);
            // Wait a bit to refresh stock
            setTimeout(fetchData, 1000);

        } catch (error: any) {
            toast.error(error.message || 'Checkout failed');
        } finally {
            setIsProcessing(false);
        }
    };

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchCategory = activeCategory === 'All' ||
            (typeof p.category === 'object' ? p.category.name === activeCategory : p.category === activeCategory);
        return matchesSearch && matchCategory;
    });

    if (loading) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <Loader2 className="w-12 h-12 text-yellow-600 animate-spin" />
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-100 font-sans text-gray-900 flex flex-col">
            {/* Header - Amazon-like Dark Navy */}
            <header className="bg-slate-900 text-white sticky top-0 z-30 shadow-md">
                <div className="container mx-auto px-4 py-3">
                    <div className="flex md:flex-row items-center gap-4 justify-between">
                        {/* Search Bar - Taking more width now since logo is gone */}
                        <div className="flex-1 w-full max-w-4xl relative">
                            <div className="flex w-full">
                                <div className="relative w-full">
                                    <input
                                        type="text"
                                        placeholder="Search for supplements, gear, and more..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full h-10 pl-4 pr-10 rounded-l-md border-none focus:ring-2 focus:ring-yellow-500 text-gray-900 bg-gray-100 focus:bg-white transition-colors"
                                    />
                                </div>
                                <button className="bg-yellow-500 hover:bg-yellow-600 text-slate-900 px-6 rounded-r-md flex items-center justify-center transition-colors">
                                    <Search className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Cart & Actions */}
                        <div className="flex items-center gap-6 min-w-max ml-auto">
                            <button
                                onClick={() => setIsCartOpen(true)}
                                className="flex items-center gap-2 hover:text-yellow-400 transition group relative"
                            >
                                <div className="relative">
                                    <ShoppingCart className="w-6 h-6" />
                                    {cart.length > 0 && (
                                        <span className="absolute -top-2 -right-2 bg-yellow-500 text-slate-900 text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-slate-900">
                                            {cart.reduce((a, b) => a + b.quantity, 0)}
                                        </span>
                                    )}
                                </div>
                                <span className="font-semibold hidden sm:block">Cart</span>
                            </button>
                        </div>
                    </div>

                    {/* Category Navigation Bar */}
                    <div className="flex gap-4 mt-4 overflow-x-auto pb-1 scrollbar-hide text-sm border-t border-slate-700 pt-3">
                        {['All', ...categories.map(c => c.name)].map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`whitespace-nowrap px-1 pb-1 border-b-2 transition-colors ${activeCategory === cat
                                    ? 'border-yellow-500 text-yellow-400 font-bold'
                                    : 'border-transparent text-gray-300 hover:text-white hover:border-gray-500'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8 flex-grow">
                {/* Results Info */}
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-800">
                        {activeCategory === 'All' ? 'Featured Products' : `${activeCategory} Products`}
                    </h2>
                    <span className="text-sm text-gray-500">{filteredProducts.length} items found</span>
                </div>

                {/* Product Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredProducts.map(product => (
                        <div key={product._id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col h-full group relative">
                            {/* Out of Stock Badge */}
                            {product.stockQuantity === 0 && (
                                <div className="absolute top-0 left-0 bg-red-600 text-white text-xs font-bold px-3 py-1 z-10 rounded-br-lg">
                                    OUT OF STOCK
                                </div>
                            )}

                            {/* Image Area */}
                            <div className="h-56 p-4 bg-white flex items-center justify-center relative overflow-hidden border-b border-gray-100">
                                <img
                                    src={product.image || 'https://placehold.co/600x400?text=Product'}
                                    alt={product.name}
                                    className={`max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-105 ${product.stockQuantity === 0 ? 'opacity-50 grayscale' : ''}`}
                                />
                            </div>

                            {/* Content */}
                            <div className="p-5 flex flex-col flex-1">
                                <div className="mb-1 text-xs text-gray-500 uppercase tracking-wide">
                                    {typeof product.category === 'object' ? product.category.name : 'General'}
                                </div>
                                <h3 className="font-medium text-gray-900 text-lg leading-snug mb-2 line-clamp-2 hover:text-blue-700 cursor-pointer" title={product.name}>
                                    {product.name}
                                </h3>

                                {product.ratingCount !== undefined && product.ratingCount > 0 ? (
                                    <div className="flex items-center mb-2">
                                        <div className="flex items-center">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <svg
                                                    key={star}
                                                    className={`w-4 h-4 ${star <= Math.round(product.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300 fill-current'}`}
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                            ))}
                                        </div>
                                        <span className="text-xs text-blue-600 ml-1 hover:underline cursor-pointer">{product.ratingCount} ratings</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center mb-2">
                                        <div className="flex items-center">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <svg key={star} className="w-4 h-4 text-gray-200 fill-current" viewBox="0 0 20 20">
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                            ))}
                                            <span className="text-[10px] text-gray-400 ml-1 italic">New Arrival</span>
                                        </div>
                                    </div>
                                )}

                                <div className="mt-auto pt-4 flex flex-col gap-3">
                                    <div className="flex items-baseline gap-2 flex-wrap">
                                        <span className="text-2xl font-bold text-gray-900">
                                            ₹{(product.discount && product.discount > 0
                                                ? (product.price - (product.price * product.discount / 100))
                                                : product.price).toLocaleString()}
                                        </span>
                                        {product.discount && product.discount > 0 ? (
                                            <>
                                                <span className="text-sm text-gray-500 line-through">₹{product.price.toLocaleString()}</span>
                                                <span className="text-sm text-green-600 font-medium whitespace-nowrap">Save {product.discount}%</span>
                                            </>
                                        ) : null}
                                    </div>

                                    <button
                                        onClick={() => addToCart(product)}
                                        disabled={product.stockQuantity === 0}
                                        className="w-full py-2.5 rounded-full font-medium text-sm transition-all focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2
                                            bg-yellow-400 hover:bg-yellow-500 text-slate-900 shadow-sm disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
                                    >
                                        {product.stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredProducts.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-lg border border-gray-200 mt-6">
                        <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-medium text-gray-900">No products found</h3>
                        <p className="text-gray-500 mt-2">Try adjusting your search or category filter.</p>
                        <button
                            onClick={() => { setSearchTerm(''); setActiveCategory('All'); }}
                            className="mt-4 text-blue-600 hover:underline"
                        >
                            Clear all filters
                        </button>
                    </div>
                )}
            </main>

            <Footer variant="store" />

            {/* Cart Drawer */}
            {isCartOpen && (
                <div className="fixed inset-0 z-50 flex justify-end transition-opacity duration-300">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />
                    <div className="relative w-full max-w-md bg-white shadow-2xl h-full flex flex-col animate-slideInRight">
                        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-slate-50">
                            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                <ShoppingCart className="w-5 h-5 text-gray-600" /> Shopping Cart
                            </h2>
                            <button onClick={() => setIsCartOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-200 rounded-full transition">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-white">
                            {cart.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-64 text-center">
                                    <div className="bg-gray-100 p-6 rounded-full mb-4">
                                        <ShoppingCart className="w-12 h-12 text-gray-300" />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900">Your cart is empty</h3>
                                    <p className="text-gray-500 text-sm mt-1 mb-6">Looks like you haven't added anything yet.</p>
                                    <button
                                        onClick={() => setIsCartOpen(false)}
                                        className="text-blue-600 font-medium hover:underline"
                                    >
                                        Start Shopping
                                    </button>
                                </div>
                            ) : (
                                cart.map(item => (
                                    <div key={item.product._id} className="flex gap-4 p-4 border border-gray-100 rounded-xl hover:border-gray-200 transition-colors bg-white shadow-sm">
                                        <div className="w-20 h-20 bg-gray-50 rounded-lg flex items-center justify-center p-2 flex-shrink-0">
                                            <img src={item.product.image} className="w-full h-full object-contain" alt={item.product.name} />
                                        </div>
                                        <div className="flex-1 flex flex-col justify-between">
                                            <div>
                                                <h4 className="font-medium text-gray-900 line-clamp-1">{item.product.name}</h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-sm font-bold text-gray-900">₹{calculateItemPrice(item.product).toLocaleString()}</span>
                                                    {item.quantity > 1 && (
                                                        <span className="text-xs text-gray-500">Each</span>
                                                    )}
                                                    {item.product.discount && item.product.discount > 0 && (
                                                        <span className="text-xs text-green-600 bg-green-50 px-1 rounded">-{item.product.discount}%</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center mt-3">
                                                <div className="flex items-center border border-gray-300 rounded-md bg-gray-50">
                                                    <button onClick={() => updateQuantity(item.product._id, -1)} className="p-1 px-2 hover:bg-gray-200 text-gray-600 rounded-l-md transition"><Minus className="w-3 h-3" /></button>
                                                    <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                                                    <button onClick={() => updateQuantity(item.product._id, 1)} className="p-1 px-2 hover:bg-gray-200 text-gray-600 rounded-r-md transition"><Plus className="w-3 h-3" /></button>
                                                </div>
                                                <span className="font-bold text-gray-900">₹{(calculateItemPrice(item.product) * item.quantity).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {cart.length > 0 && (
                            <div className="p-6 border-t border-gray-100 bg-gray-50">
                                <div className="space-y-3 mb-6">
                                    <div className="flex justify-between text-gray-600">
                                        <span>Subtotal ({cart.reduce((a, b) => a + b.quantity, 0)} items)</span>
                                        <span>₹{cartTotal.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-lg font-bold text-gray-900 pt-3 border-t border-gray-200">
                                        <span>Total</span>
                                        <span className="text-xl">₹{cartTotal.toLocaleString()}</span>
                                    </div>
                                    <p className="text-xs text-green-600 text-center font-medium">Free delivery on this order</p>
                                </div>
                                <button
                                    onClick={() => { setIsCartOpen(false); setIsCheckoutOpen(true); }}
                                    className="w-full py-3.5 bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold rounded-lg shadow-sm transition-all transform active:scale-95"
                                >
                                    Proceed to Checkout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Checkout Modal */}
            {isCheckoutOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsCheckoutOpen(false)} />
                    <div className="relative bg-white sm:rounded-2xl w-full max-w-4xl h-full sm:h-auto sm:max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-20">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <ShoppingBag className="w-5 h-5 text-yellow-600" /> Checkout
                            </h2>
                            <button onClick={() => setIsCheckoutOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Modal Body - Scrollable */}
                        <div className="flex-1 overflow-y-auto flex flex-col md:flex-row scrollbar-hide">
                            {/* Left Side - Form */}
                            <div className="w-full md:w-3/5 p-6 md:p-8 space-y-8">
                                <div className="space-y-6">
                                    {/* Customer Info */}
                                    <section>
                                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs">1</div>
                                            Customer Details
                                        </h3>
                                        <div className="grid gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                                                <input
                                                    type="email"
                                                    placeholder="Enter registered email"
                                                    value={customerEmail}
                                                    onChange={e => setCustomerEmail(e.target.value)}
                                                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition text-gray-900 placeholder:text-gray-400"
                                                />
                                                <p className="text-xs text-blue-600 mt-1">We'll link this to your gym membership profile.</p>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                                    <input
                                                        type="text"
                                                        placeholder="John Doe"
                                                        value={customerName}
                                                        onChange={e => setCustomerName(e.target.value)}
                                                        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition text-gray-900"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                                    <input
                                                        type="tel"
                                                        placeholder="+91..."
                                                        value={customerPhone}
                                                        onChange={e => setCustomerPhone(e.target.value)}
                                                        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition text-gray-900"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </section>

                                    {/* Payment Method */}
                                    <section>
                                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs">2</div>
                                            Payment Method
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <button
                                                onClick={() => setPaymentMode('online')}
                                                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-all ${paymentMode === 'online'
                                                    ? 'border-yellow-500 bg-yellow-50 text-yellow-700 shadow-sm'
                                                    : 'border-gray-200 hover:border-gray-300 text-gray-600 bg-white'
                                                    }`}
                                            >
                                                <div className={`p-3 rounded-full ${paymentMode === 'online' ? 'bg-yellow-200' : 'bg-gray-100'}`}>
                                                    <QrCode className="w-6 h-6" />
                                                </div>
                                                <span className="font-semibold text-sm">UPI / QR Code</span>
                                            </button>
                                            <button
                                                onClick={() => setPaymentMode('cash')}
                                                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-all ${paymentMode === 'cash'
                                                    ? 'border-green-500 bg-green-50 text-green-700 shadow-sm'
                                                    : 'border-gray-200 hover:border-gray-300 text-gray-600 bg-white'
                                                    }`}
                                            >
                                                <div className={`p-3 rounded-full ${paymentMode === 'cash' ? 'bg-green-200' : 'bg-gray-100'}`}>
                                                    <Banknote className="w-6 h-6" />
                                                </div>
                                                <span className="font-semibold text-sm">Pay at Counter</span>
                                            </button>
                                        </div>
                                    </section>
                                </div>
                            </div>

                            {/* Right Side - Summary */}
                            <div className="w-full md:w-2/5 bg-slate-50 border-t md:border-t-0 md:border-l border-gray-200 p-6 md:p-8 flex flex-col">
                                <div className="flex-1">
                                    <h3 className="font-bold text-gray-900 mb-6 font-sans">Order Summary</h3>
                                    <div className="space-y-4 mb-6 max-h-48 md:max-h-none overflow-y-auto pr-2 custom-scrollbar">
                                        {cart.map(item => {
                                            const originalItemTotal = item.product.price * item.quantity;
                                            const finalItemTotal = calculateItemPrice(item.product) * item.quantity;
                                            const hasDiscount = item.product.discount && item.product.discount > 0;

                                            return (
                                                <div key={item.product._id} className="flex justify-between items-start text-sm">
                                                    <div className="flex flex-col flex-1 pr-4">
                                                        <span className="text-gray-700 font-medium">
                                                            {item.quantity}x {item.product.name}
                                                        </span>
                                                        {hasDiscount && (
                                                            <span className="text-xs text-green-600">
                                                                Discount applied (-{item.product.discount}%)
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col items-end">
                                                        <span className="font-bold text-gray-900">₹{finalItemTotal.toLocaleString()}</span>
                                                        {hasDiscount && (
                                                            <span className="text-xs text-gray-400 line-through">₹{originalItemTotal.toLocaleString()}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className="border-t border-gray-200 pt-4 space-y-2">
                                        <div className="flex justify-between text-sm text-gray-500">
                                            <span>Subtotal</span>
                                            <span>₹{originalTotal.toLocaleString()}</span>
                                        </div>

                                        {totalSavings > 0 && (
                                            <div className="flex justify-between text-sm text-green-600 font-medium">
                                                <span>Total Savings</span>
                                                <span>-₹{totalSavings.toLocaleString()}</span>
                                            </div>
                                        )}

                                        <div className="flex justify-between text-sm text-gray-500">
                                            <span>Taxes</span>
                                            <span>₹0</span>
                                        </div>

                                        <div className="flex justify-between text-xl font-bold text-gray-900 pt-3 border-t border-gray-200 mt-2">
                                            <span>Total Amount</span>
                                            <span className="text-yellow-600">₹{cartTotal.toLocaleString()}</span>
                                        </div>
                                    </div>

                                    <div className="mt-8 bg-white md:bg-transparent p-4 md:p-0 rounded-xl md:rounded-none border md:border-none sticky bottom-0 md:relative">
                                        {paymentMode === 'online' && (
                                            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm mb-6 text-center">
                                                <p className="font-medium text-gray-700 mb-3 text-sm">Scan QR to pay securely</p>
                                                <div className="bg-gray-50 p-2 rounded inline-block">
                                                    <img src={gpayQR} alt="QR Code" className="w-32 h-32 object-contain mix-blend-multiply" />
                                                </div>
                                            </div>
                                        )}

                                        {paymentMode === 'cash' && (
                                            <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-6 text-center">
                                                <p className="text-green-800 font-medium text-sm">Cash Payment Selected</p>
                                                <p className="text-green-600 text-xs mt-1">Please pay at the gym counter upon collection.</p>
                                            </div>
                                        )}

                                        <button
                                            onClick={handleCheckout}
                                            disabled={isProcessing}
                                            className={`w-full py-4 font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 transform active:scale-95 ${paymentMode === 'online'
                                                ? 'bg-slate-900 text-white hover:bg-slate-800'
                                                : 'bg-yellow-400 hover:bg-yellow-500 text-slate-900'
                                                }`}
                                        >
                                            {isProcessing ? <Loader2 className="animate-spin w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                                            {paymentMode === 'online' ? 'Confirm Payment & Order' : 'Place Cash Order'}
                                        </button>
                                        <p className="text-center text-xs text-gray-400 mt-4 flex items-center justify-center gap-1">
                                            <CheckCircle2 className="w-3 h-3 text-green-500" /> Secure Encryption
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Special Offer Popup */}
            {showOfferPopup && offerProduct && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-fadeIn">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowOfferPopup(false)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-bounceIn">
                        {/* Decorative Header */}
                        <div className="bg-gradient-to-r from-yellow-500 to-yellow-400 p-4 text-center relative overflow-hidden">
                            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
                            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-wider relative z-10 drop-shadow-sm">
                                🎉 Special Offer!
                            </h3>
                            <button
                                onClick={() => setShowOfferPopup(false)}
                                className="absolute top-2 right-2 text-slate-900/60 hover:text-slate-900 hover:bg-white/20 rounded-full p-1 transition"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 text-center">
                            <div className="w-32 h-32 mx-auto mb-4 bg-gray-50 rounded-xl p-2 flex items-center justify-center border border-gray-100 shadow-inner">
                                <img
                                    src={offerProduct.image}
                                    alt={offerProduct.name}
                                    className="max-w-full max-h-full object-contain"
                                />
                            </div>

                            <h4 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">{offerProduct.name}</h4>

                            <p className="text-gray-500 text-sm mb-4">
                                Get this exclusive deal while stocks last!
                            </p>

                            <div className="bg-yellow-50 rounded-xl p-3 mb-6 border border-yellow-100 inline-block w-full">
                                <div className="flex items-center justify-center gap-3">
                                    <span className="text-gray-400 line-through text-lg">₹{offerProduct.price.toLocaleString()}</span>
                                    <span className="text-3xl font-bold text-slate-900">
                                        ₹{(offerProduct.price - (offerProduct.price * (offerProduct.discount || 0) / 100)).toLocaleString()}
                                    </span>
                                </div>
                                <div className="text-green-600 font-bold text-sm mt-1">
                                    SAVE {offerProduct.discount}% TODAY
                                </div>
                            </div>

                            <div className="space-y-3">
                                <button
                                    onClick={() => {
                                        addToCart(offerProduct);
                                        setShowOfferPopup(false);
                                    }}
                                    className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold hover:bg-slate-800 transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                                >
                                    <ShoppingCart className="w-5 h-5" />
                                    Add to Cart Now
                                </button>
                                <button
                                    onClick={() => setShowOfferPopup(false)}
                                    className="text-gray-400 hover:text-gray-600 text-sm font-medium transition"
                                >
                                    No thanks, I'll pay full price
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StorePage;
