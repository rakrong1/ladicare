// src/services/api.ts

import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from 'axios';
import { Product } from '../types/product';

const API_BASE_URL =
  import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach token
api.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle auth errors
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // Optional: redirect if not already on login
      if (!window.location.pathname.includes('/admin')) {
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

// -----------------------------
// ✅ API CLASS
// -----------------------------
class ApiService {
  constructor(private axiosInstance: AxiosInstance) {}

  get defaults() {
    return this.axiosInstance.defaults;
  }

  // Generic Methods
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const res = await this.axiosInstance.get<T>(url, config);
    return res.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const res = await this.axiosInstance.post<T>(url, data, config);
    return res.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const res = await this.axiosInstance.put<T>(url, data, config);
    return res.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const res = await this.axiosInstance.delete<T>(url, config);
    return res.data;
  }

  async postForm<T>(url: string, formData: FormData): Promise<T> {
    const res = await this.axiosInstance.post<T>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  }

  async putForm<T>(url: string, formData: FormData): Promise<T> {
    const res = await this.axiosInstance.put<T>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  }

  // -----------------------------
  // ✅ AUTH
  // -----------------------------
  login(payload: { email: string; password: string }) {
    return this.post<{ token: string; user: any }>('/auth/login', payload);
  }

  register(payload: { name: string; email: string; password: string }) {
    return this.post<{ token: string; user: any }>('/auth/register', payload);
  }

  logout() {
    return this.post<void>('/auth/logout');
  }

  // -----------------------------
  // ✅ PRODUCTS & CATEGORIES
  // -----------------------------
  getProducts(params?: {
    category?: number;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    return this.get<{ success: boolean; data: Product[]; total?: number }>('/products', { params });
  }

  getProduct(id: number) {
    return this.get<{ success: boolean; data: Product }>(`/products/${id}`);
  }

  getProductsByCategory(categoryId: number) {
    return this.get<{ success: boolean; data: Product[] }>(`/products/category/${categoryId}`);
  }

  getCategories() {
    return this.get<{ success: boolean; data: any[] }>('/categories');
  }

  getCategory(id: number) {
    return this.get<{ success: boolean; data: any }>(`/categories/${id}`);
  }

  // -----------------------------
  // ✅ ORDERS
  // -----------------------------
  createOrder(orderData: any) {
    return this.post<{ success: boolean; data: any }>('/orders', orderData);
  }

  getOrder(id: number) {
    return this.get<{ success: boolean; data: any }>(`/orders/${id}`);
  }

  // -----------------------------
  // ✅ REVIEWS
  // -----------------------------
  getProductReviews(productId: number) {
    return this.get<{ success: boolean; data: any[] }>(`/reviews/product/${productId}`);
  }

  createReview(reviewData: any) {
    return this.post<{ success: boolean; data: any }>('/reviews', reviewData);
  }

  // -----------------------------
  // ✅ ADMIN ROUTES
  // -----------------------------
  admin = {
    getAllProducts: () => this.get<{ success: boolean; data: Product[] }>('/admin/products'),
    createProduct: (data: Partial<Product>) => this.post<{ success: boolean; data: Product }>('/admin/products', data),
    updateProduct: (id: number, data: Partial<Product>) => this.put<{ success: boolean; data: Product }>(`/admin/products/${id}`, data),
    deleteProduct: (id: number) => this.delete<{ success: boolean }>(`/admin/products/${id}`),
    approveProduct: (id: number) => this.put<{ success: boolean; data: Product }>(`/admin/products/${id}/approve`),
    rejectProduct: (id: number, notes?: string) => this.put<{ success: boolean; data: Product }>(`/admin/products/${id}/reject`, { notes }),
    getAllOrders: () => this.get<{ success: boolean; data: any[] }>('/admin/orders'),
    updateOrderStatus: (id: number, status: string) => this.put<{ success: boolean; data: any }>(`/admin/orders/${id}/status`, { status }),
    getOrderDetails: (id: number) => this.get<{ success: boolean; data: any }>(`/admin/orders/${id}`),
    createCategory: (data: any) => this.post<{ success: boolean; data: any }>('/admin/categories', data),
    updateCategory: (id: number, data: any) => this.put<{ success: boolean; data: any }>(`/admin/categories/${id}`, data),
    deleteCategory: (id: number) => this.delete<{ success: boolean }>(`/admin/categories/${id}`),
    getAllReviews: () => this.get<{ success: boolean; data: any[] }>('/admin/reviews'),
    getPendingReviews: () => this.get<{ success: boolean; data: any[] }>('/admin/reviews/pending'),
    approveReview: (id: number) => this.put<{ success: boolean; data: any }>(`/admin/reviews/${id}/approve`),
    rejectReview: (id: number) => this.put<{ success: boolean; data: any }>(`/admin/reviews/${id}/reject`),
    deleteReview: (id: number) => this.delete<{ success: boolean }>(`/admin/reviews/${id}`),
    getDashboardStats: () => this.get<{ success: boolean; data: any }>('/admin/dashboard/stats'),
    getRecentActivity: () => this.get<{ success: boolean; data: any[] }>('/admin/dashboard/activity'),
  };

  // -----------------------------
  // ✅ UTILS
  // -----------------------------
  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  setAuthToken(token: string) {
    localStorage.setItem('token', token);
    this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  clearAuthToken() {
    localStorage.removeItem('token');
    delete this.axiosInstance.defaults.headers.common['Authorization'];
  }
}

const apiService = new ApiService(api);

export { api as axiosInstance };
export default apiService;
