import { API_BASE_URL } from '../App';

interface ApiOptions extends RequestInit {
  requireAuth?: boolean;
}

/**
 * API client with automatic token handling and error management
 */
export const apiClient = async (
  endpoint: string,
  options: ApiOptions = {}
): Promise<Response> => {
  const { requireAuth = true, headers = {}, ...restOptions } = options;

  // Get token from sessionStorage
  const token = sessionStorage.getItem('token');

  // Prepare headers
  const requestHeaders: any = {
    ...headers,
  };

  // Only set application/json if body is not FormData
  if (!(options.body instanceof FormData)) {
    requestHeaders['Content-Type'] = 'application/json';
  }

  // Add authorization header if auth is required
  if (requireAuth) {
    if (!token) {
      throw new Error('No authentication token found. Please login.');
    }
    requestHeaders['Authorization'] = `Bearer ${token}`;
  }

  // Make the request
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...restOptions,
    headers: requestHeaders,
    credentials: 'include', // Important for cookies
  });

  // Handle 401 Unauthorized - token expired or invalid
  if (response.status === 401) {
    // Clear token and redirect to login
    sessionStorage.removeItem('token');

    // Only redirect if we're not already on the login page or reset password page
    if (!window.location.pathname.includes('/admin/login') && !window.location.pathname.includes('/admin/reset-password')) {
      window.location.href = '/admin/login';
    }

    throw new Error('Session expired. Please login again.');
  }

  return response;
};

/**
 * Verify authentication token
 */
export const verifyAuth = async (): Promise<boolean> => {
  try {
    const response = await apiClient('/api/auth/verify', {
      method: 'GET',
    });

    return response.ok;
  } catch (error) {
    return false;
  }
};

/**
 * Settings API methods
 */
export interface Settings {
  planPricing: {
    '1month': number;
    '2month': number;
    '3month': number;
    '6month': number;
    'yearly': number;
  };
  gymInfo: {
    name: string;
    address: string;
    phone: string;
    email: string;
    website: string;
    businessHours: string;
    footer: {
      openingHours: {
        days: string;
        morningHours: string;
        eveningHours: string;
      };
      paymentMethods: string;
      contactEmail: string;
      contactPhone: string;
    };
  };
  emailSettings: {
    enabled: boolean;
    fromEmail: string;
    fromName: string;
  };
  notificationSettings: {
    emailNotifications: boolean;
    whatsappNotifications: boolean;
    renewalReminders: boolean;
    expiryReminders: boolean;
  };
  systemPreferences: {
    currency: string;
    currencySymbol: string;
    dateFormat: string;
    timezone: string;
  };
  offers?: {
    name: string;
    description: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    applicablePlans: string[];
    isActive: boolean;
    validUntil?: string;
  }[];
}

export const getSettings = async (): Promise<Settings> => {
  const response = await apiClient('/api/settings', {
    method: 'GET',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch settings');
  }

  const data = await response.json();
  return data.data;
};

export const updateSettings = async (settings: Partial<Settings>): Promise<Settings> => {
  const response = await apiClient('/api/settings', {
    method: 'PUT',
    body: JSON.stringify(settings),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update settings');
  }

  const data = await response.json();
  return data.data;
};

// Public method to get plan pricing (no auth required)
export const getPlanPricing = async (): Promise<Settings['planPricing']> => {
  const response = await fetch(`${API_BASE_URL}/api/settings/pricing`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch plan pricing');
  }

  const data = await response.json();
  return data.data.planPricing;
};

// Public method to get gym info (no auth required)
export const getGymInfo = async (): Promise<Settings['gymInfo']> => {
  const response = await fetch(`${API_BASE_URL}/api/settings/gym-info`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch gym info');
  }

  const data = await response.json();
  return data.data.gymInfo;
};

// Public method to get active offers (no auth required)
export const getActiveOffers = async (): Promise<Settings['offers']> => {
  const response = await fetch(`${API_BASE_URL}/api/settings/offers`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch offers');
  }

  const data = await response.json();
  return data.data.offers;
};

export interface Expense {
  _id?: string;
  title: string;
  amount: number;
  category: 'Rent' | 'Utilities' | 'Salaries' | 'Maintenance' | 'Equipment' | 'Marketing' | 'Other';
  date: string;
  paymentMethod: 'Cash' | 'Online';
  description?: string;
}

export const getExpenses = async (month?: number, year?: number): Promise<Expense[]> => {
  let url = '/api/expenses';
  const queryParams = [];
  if (month !== undefined) queryParams.push(`month=${month}`);
  if (year !== undefined) queryParams.push(`year=${year}`);

  if (queryParams.length > 0) {
    url += `?${queryParams.join('&')}`;
  }

  const response = await apiClient(url, {
    method: 'GET',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch expenses');
  }

  const data = await response.json();
  return data.data.expenses;
};

export const addExpense = async (expense: Omit<Expense, '_id'>): Promise<Expense> => {
  const response = await apiClient('/api/expenses', {
    method: 'POST',
    body: JSON.stringify(expense),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to add expense');
  }

  const data = await response.json();
  return data.data.expense;
};

export const deleteExpense = async (id: string): Promise<void> => {
  const response = await apiClient(`/api/expenses/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete expense');
  }
};

export interface ContactInquiry {
  _id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'replied';
  createdAt: string;
}

export const submitContactForm = async (contactData: Omit<ContactInquiry, '_id' | 'status' | 'createdAt'>): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(contactData),
  });

  const data = await response.json();
  if (!data.success) throw new Error(data.error);
};

export const getContactInquiries = async (): Promise<ContactInquiry[]> => {
  const response = await apiClient('/api/contact', { method: 'GET' });
  const data = await response.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
};

export const updateInquiryStatus = async (id: string, status: string): Promise<void> => {
  const response = await apiClient(`/api/contact/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
  const data = await response.json();
  if (!data.success) throw new Error(data.error);
};
