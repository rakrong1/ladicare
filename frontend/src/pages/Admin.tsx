import React, { useState } from 'react';
import { useProducts } from './ProductContext';

const Admin = () => {
  const { products, categories } = useProducts();
  const [activeTab, setActiveTab] = useState('dashboard');

  const stats = {
    totalProducts: products.length,
    totalOrders: 24,
    totalRevenue: 15780,
    pendingReviews: 8
  };

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: '📊' },
    { id: 'products', name: 'Products', icon: '📦' },
    { id: 'orders', name: 'Orders', icon: '🛍️' },
    { id: 'categories', name: 'Categories', icon: '📂' },
  ];

  return (
    <div className="pt-24 pb-12 px-4 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4 animate-fade-in">
            Admin Panel
          </h1>
          <p className="text-xl text-white/80 animate-fade-in">
            Manage your Ladicare store
          </p>
        </div>

        {/* Tabs */}
        <div className="glass-card p-6 mb-8 animate-fade-in-scale">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-lg transition-all duration-300 flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'glass-button-primary'
                    : 'glass-button hover-lift'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </div>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="animate-fade-in">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="glass-card p-6 text-center hover-lift">
                <div className="text-3xl mb-2">📦</div>
                <h3 className="text-2xl font-bold text-white">{stats.totalProducts}</h3>
                <p className="text-white/70">Total Products</p>
              </div>
              <div className="glass-card p-6 text-center hover-lift">
                <div className="text-3xl mb-2">🛍️</div>
                <h3 className="text-2xl font-bold text-white">{stats.totalOrders}</h3>
                <p className="text-white/70">Total Orders</p>
              </div>
              <div className="glass-card p-6 text-center hover-lift">
                <div className="text-3xl mb-2">💰</div>
                <h3 className="text-2xl font-bold text-white">${stats.totalRevenue.toLocaleString()}</h3>
                <p className="text-white/70">Total Revenue</p>
              </div>
              <div className="glass-card p-6 text-center hover-lift">
                <div className="text-3xl mb-2">⭐</div>
                <h3 className="text-2xl font-bold text-white">{stats.pendingReviews}</h3>
                <p className="text-white/70">Pending Reviews</p>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="glass-card p-8">
              <h2 className="text-2xl font-semibold text-white mb-6">Recent Activity</h2>
              <div className="space-y-4">
                {[
                  { action: 'New order', detail: 'Order #1234 - $89.99', time: '5 minutes ago', icon: '🛍️' },
                  { action: 'Product review', detail: 'Premium Face Moisturizer - 5 stars', time: '1 hour ago', icon: '⭐' },
                  { action: 'New customer', detail: 'Sarah Johnson registered', time: '2 hours ago', icon: '👤' },
                  { action: 'Inventory update', detail: 'Vitamin C Serum restocked', time: '4 hours ago', icon: '📦' },
                ].map((activity, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 glass-card hover-lift">
                    <div className="text-2xl">{activity.icon}</div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-white">{activity.action}</h4>
                      <p className="text-white/70 text-sm">{activity.detail}</p>
                    </div>
                    <span className="text-white/60 text-sm">{activity.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="animate-fade-in">
            <div className="glass-card p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-white">Products Management</h2>
                <button className="glass-button-primary px-6 py-3 hover-lift">
                  Add New Product
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/20">
                      <th className="text-left py-3 px-4 text-white font-semibold">Product</th>
                      <th className="text-left py-3 px-4 text-white font-semibold">Category</th>
                      <th className="text-left py-3 px-4 text-white font-semibold">Price</th>
                      <th className="text-left py-3 px-4 text-white font-semibold">Stock</th>
                      <th className="text-left py-3 px-4 text-white font-semibold">Status</th>
                      <th className="text-left py-3 px-4 text-white font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.slice(0, 5).map((product) => (
                      <tr key={product.id} className="border-b border-white/10 hover:bg-white/5">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                            <span className="text-white font-medium">{product.name}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-white/80 capitalize">{product.category}</td>
                        <td className="py-4 px-4 text-white/80">${product.price}</td>
                        <td className="py-4 px-4 text-white/80">{product.stock}</td>
                        <td className="py-4 px-4">
                          <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm capitalize">
                            {product.status}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex gap-2">
                            <button className="glass-button px-3 py-1 text-sm">Edit</button>
                            <button className="glass-button px-3 py-1 text-sm text-red-400">Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="animate-fade-in">
            <div className="glass-card p-8">
              <h2 className="text-2xl font-semibold text-white mb-6">Orders Management</h2>
              
              <div className="space-y-4">
                {[
                  { id: '1234', customer: 'Sarah Johnson', total: 89.99, status: 'Processing', date: '2024-01-15' },
                  { id: '1235', customer: 'Michael Chen', total: 156.47, status: 'Shipped', date: '2024-01-14' },
                  { id: '1236', customer: 'Emma Rodriguez', total: 75.99, status: 'Delivered', date: '2024-01-13' },
                ].map((order) => (
                  <div key={order.id} className="glass-card p-6 hover-lift">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-white">Order #{order.id}</h3>
                        <p className="text-white/70">{order.customer}</p>
                        <p className="text-white/60 text-sm">{order.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-white">${order.total}</p>
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          order.status === 'Processing' ? 'bg-yellow-500/20 text-yellow-400' :
                          order.status === 'Shipped' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-green-500/20 text-green-400'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div className="animate-fade-in">
            <div className="glass-card p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-white">Categories Management</h2>
                <button className="glass-button-primary px-6 py-3 hover-lift">
                  Add New Category
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((category) => (
                  <div key={category.id} className="glass-card p-6 hover-lift">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-2xl">
                      🌟
                    </div>
                    <h3 className="text-xl font-semibold text-white text-center mb-2">
                      {category.name}
                    </h3>
                    <p className="text-white/70 text-center mb-4">{category.description}</p>
                    <p className="text-purple-300 text-center font-medium">
                      {category.productCount} products
                    </p>
                    <div className="flex gap-2 mt-4">
                      <button className="glass-button flex-1 py-2 text-sm">Edit</button>
                      <button className="glass-button flex-1 py-2 text-sm text-red-400">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
