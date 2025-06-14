// admin/src/services/api.js
const API_BASE_URL = 'http://localhost:5000/api';

class AdminApiService {
  async request(endpoint, options = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        credentials: 'include',
        ...options,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Products API
  async getProducts(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.request(`/admin/products?${params}`);
  }

  async getProduct(id) {
    return this.request(`/admin/products/${id}`);
  }

  async createProduct(productData) {
    return this.request('/admin/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  async updateProduct(id, productData) {
    return this.request(`/admin/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  }

  async deleteProduct(id) {
    return this.request(`/admin/products/${id}`, {
      method: 'DELETE',
    });
  }

  async updateProductStatus(id, status) {
    return this.request(`/admin/products/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // Categories API
  async getCategories() {
    return this.request('/admin/categories');
  }

  async createCategory(categoryData) {
    return this.request('/admin/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
  }

  async updateCategory(id, categoryData) {
    return this.request(`/admin/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData),
    });
  }

  async deleteCategory(id) {
    return this.request(`/admin/categories/${id}`, {
      method: 'DELETE',
    });
  }

  // Orders API
  async getOrders(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.request(`/admin/orders?${params}`);
  }

  async getOrder(id) {
    return this.request(`/admin/orders/${id}`);
  }

  async updateOrderStatus(id, status) {
    return this.request(`/admin/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // Reviews API
  async getReviews(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.request(`/admin/reviews?${params}`);
  }

  async approveReview(id) {
    return this.request(`/admin/reviews/${id}/approve`, {
      method: 'PATCH',
    });
  }

  async rejectReview(id) {
    return this.request(`/admin/reviews/${id}/reject`, {
      method: 'PATCH',
    });
  }

  async deleteReview(id) {
    return this.request(`/admin/reviews/${id}`, {
      method: 'DELETE',
    });
  }

  // Dashboard API
  async getDashboardStats() {
    return this.request('/admin/dashboard/stats');
  }

  async getRecentActivity() {
    return this.request('/admin/dashboard/activity');
  }

  // File Upload API
  async uploadFile(file, type = 'image') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    return this.request('/admin/upload', {
      method: 'POST',
      headers: {}, // Let fetch set the boundary for FormData
      body: formData,
    });
  }

  async uploadMultipleFiles(files, type = 'image') {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`files`, file);
    });
    formData.append('type', type);

    return this.request('/admin/upload/multiple', {
      method: 'POST',
      headers: {}, // Let fetch set the boundary for FormData
      body: formData,
    });
  }
}

export default new AdminApiService();