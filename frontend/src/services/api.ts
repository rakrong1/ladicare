import { Product } from '../types/product'; // adjust path if needed

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';

class ApiService {
  private getHeaders(isJson = true): HeadersInit {
    const headers: HeadersInit = {};
    const token = localStorage.getItem('token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (isJson) headers['Content-Type'] = 'application/json';
    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type');
    const data = contentType?.includes('application/json')
      ? await response.json()
      : await response.text();

    if (!response.ok) {
      throw new Error(data?.error || data?.message || `HTTP Error: ${response.status}`);
    }

    return data;
  }

  async get<T>(endpoint: string): Promise<T> {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return this.handleResponse<T>(res);
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse<T>(res);
  }

  async postForm<T>(endpoint: string, formData: FormData): Promise<T> {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(false),
      body: formData,
    });
    return this.handleResponse<T>(res);
  }

  async putForm<T>(endpoint: string, formData: FormData): Promise<T> {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: this.getHeaders(false),
      body: formData,
    });
    return this.handleResponse<T>(res);
  }

  // --------------------------
  // Custom endpoints below
  // --------------------------
  testConnection() {
    return this.get<{ status: string; message: string; timestamp: string }>('/health');
  }

  getProducts() {
    return this.get<{ success: boolean; data: Product[] }>('/products');
  }

  login(payload: { email: string; password: string }) {
    return this.post<{ token: string; user: any }>('/auth/login', payload);
  }

  register(payload: { name: string; email: string; password: string }) {
    return this.post<{ token: string; user: any }>('/auth/register', payload);
  }
}

export default new ApiService();
