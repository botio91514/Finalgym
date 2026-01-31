import { API_BASE_URL } from '../App';
import { apiClient } from './apiClient';

// --- TYPES ---

export interface Product {
    _id: string;
    name: string;
    category: { _id: string; name: string } | string;
    description?: string;
    price: number;
    discount?: number;
    stockQuantity: number;
    minStockAlert: number;
    image?: string;
    status: 'active' | 'inactive';
    rating?: number;
    ratingCount?: number;
}

export interface ProductCategory {
    _id: string;
    name: string;
    description?: string;
}

export interface StoreSale {
    _id: string;
    member?: { _id: string; name: string; email: string };
    guestDetails?: { name: string; email: string; phone: string };
    items: {
        product: { _id: string; name: string } | string;
        productName: string;
        categoryId?: string;
        categoryName?: string;
        quantity: number;
        priceAtSale: number;
        originalPrice?: number;
        discount?: number;
    }[];
    totalAmount: number;
    paidAmount: number;
    balanceAmount: number;
    paymentMode: 'cash' | 'online';
    paymentStatus: 'paid' | 'partial' | 'unpaid';
    orderStatus: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    createdAt: string;
}

// --- PUBLIC FUNCTIONS ---

export const getProducts = async (includeInactive: boolean = false): Promise<Product[]> => {
    const url = includeInactive
        ? `${API_BASE_URL}/api/store/products?includeInactive=true`
        : `${API_BASE_URL}/api/store/products`;
    const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.error);
    return data.data;
};

export const getCategories = async (): Promise<ProductCategory[]> => {
    const response = await fetch(`${API_BASE_URL}/api/store/categories`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.error);
    return data.data;
};

export const createSale = async (saleData: any): Promise<StoreSale> => {
    const response = await fetch(`${API_BASE_URL}/api/store/sales`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saleData)
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.error);
    return data.data;
};

// --- ADMIN FUNCTIONS (Auth Required) ---

export const createProduct = async (productData: Partial<Product> | FormData): Promise<Product> => {
    const response = await apiClient('/api/store/products', {
        method: 'POST',
        body: productData instanceof FormData ? productData : JSON.stringify(productData)
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.error);
    return data.data;
};

export const updateProduct = async (id: string, productData: Partial<Product> | FormData): Promise<Product> => {
    const response = await apiClient(`/api/store/products/${id}`, {
        method: 'PUT',
        body: productData instanceof FormData ? productData : JSON.stringify(productData)
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.error);
    return data.data;
};

export const deleteProduct = async (id: string): Promise<void> => {
    const response = await apiClient(`/api/store/products/${id}`, {
        method: 'DELETE'
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.error);
};

export const createCategory = async (categoryData: Partial<ProductCategory>): Promise<ProductCategory> => {
    const response = await apiClient('/api/store/categories', {
        method: 'POST',
        body: JSON.stringify(categoryData)
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.error);
    return data.data;
};

export const getSales = async (): Promise<StoreSale[]> => {
    const response = await apiClient('/api/store/sales', { method: 'GET' });
    const data = await response.json();
    if (!data.success) throw new Error(data.error);
    return data.data;
};

export const addStorePayment = async (data: { saleId: string; amount: number; paymentMode: string; notes?: string }): Promise<void> => {
    const response = await apiClient('/api/store/payments', {
        method: 'POST',
        body: JSON.stringify(data)
    });
    const resData = await response.json();
    if (!resData.success) throw new Error(resData.error);
};

export const approveSale = async (id: string): Promise<void> => {
    const response = await apiClient(`/api/store/sales/${id}/approve`, { method: 'PUT' });
    const data = await response.json();
    if (!data.success) throw new Error(data.error);
};

export const rejectSale = async (id: string): Promise<void> => {
    const response = await apiClient(`/api/store/sales/${id}/reject`, { method: 'PUT' });
    const data = await response.json();
    if (!data.success) throw new Error(data.error);
};
