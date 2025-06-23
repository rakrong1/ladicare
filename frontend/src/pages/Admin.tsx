import React, { useState } from 'react';
import { useProducts } from './ProductContext';
import api from '@/services/api';

const Admin = () => {
  const { products, categories, refetchProducts } = useProducts();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [modalProduct, setModalProduct] = useState(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);

  const [form, setForm] = useState({
    id: null,
    name: '',
    description: '',
    category_id: '',
    price: '',
    original_price: '',
    stock_quantity: '',
    thumbnail: null as File | null,
  });

  const user = null;
  const isAuthEnabled = !!user;

  const myProducts = Array.isArray(products)
    ? isAuthEnabled
      ? products.filter((p) => p.sellerId === user.id)
      : products
    : [];

  const earnings = myProducts.reduce((sum, p) => sum + p.price * (p.sales || 0), 0);

  const resetForm = () => {
    setForm({
      id: null,
      name: '',
      description: '',
      category_id: '',
      price: '',
      original_price: '',
      stock_quantity: '',
      thumbnail: null,
    });
    setUploadPreview(null);
    setModalProduct(null);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setForm((prev) => ({ ...prev, thumbnail: file }));

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setUploadPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = (product: any) => {
    setForm({
      id: product.id,
      name: product.name,
      description: product.description || '',
      category_id: product.category_id || '',
      price: product.price?.toString() || '',
      original_price: product.original_price?.toString() || '',
      stock_quantity: product.stock_quantity?.toString() || '',
      thumbnail: null,
    });
    setModalProduct(product);
    setUploadPreview(product.thumbnail || null);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this product?')) return;
    await api.delete(`/products/${id}`);
    refetchProducts();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value !== null) payload.append(key, value);
    });
    if (isAuthEnabled) payload.append('sellerId', user.id);

    try {
      if (form.id) {
        await api.putForm(`/products/${form.id}`, payload);
      } else {
        await api.postForm('/products', payload);
      }
      refetchProducts();
      resetForm();
    } catch (err) {
      console.error('Error saving product:', err);
    }
  };

  const StatCard = ({ icon, label, value }) => (
    <div className="glass-card p-6 text-center hover-lift">
      <div className="text-3xl mb-2">{icon}</div>
      <h3 className="text-2xl font-bold text-white">{value}</h3>
      <p className="text-white/70">{label}</p>
    </div>
  );

  const stats = {
    totalProducts: myProducts.length,
    totalOrders: 24,
    totalRevenue: earnings,
    pendingReviews: 3,
  };

  return (
    <div className="pt-24 pb-12 px-4 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">Admin Panel</h1>
          <p className="text-xl text-white/70">Manage your Ladicare store</p>
        </div>

        {/* Tabs */}
        <div className="glass-card p-6 mb-8">
          {['dashboard', 'products', 'orders'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-lg mr-2 ${
                activeTab === tab ? 'glass-button-primary' : 'glass-button hover-lift'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard icon="📦" label="Products" value={stats.totalProducts} />
            <StatCard icon="🛍️" label="Orders" value={stats.totalOrders} />
            <StatCard icon="💰" label="Revenue" value={`$${stats.totalRevenue}`} />
            <StatCard icon="⭐" label="Pending Reviews" value={stats.pendingReviews} />
          </div>
        )}

        {/* Products */}
        {activeTab === 'products' && (
          <div className="glass-card p-8">
            <div className="flex justify-between mb-6">
              <h2 className="text-2xl text-white font-semibold">Products</h2>
              <button onClick={() => setModalProduct({})} className="glass-button-primary px-4 py-2">
                + Add Product
              </button>
            </div>

            <table className="w-full text-white">
              <thead>
                <tr className="border-b border-white/20 text-left">
                  <th className="py-2 px-3">Product</th>
                  <th className="py-2 px-3">Category</th>
                  <th className="py-2 px-3">Price</th>
                  <th className="py-2 px-3">Stock</th>
                  <th className="py-2 px-3">Status</th>
                  <th className="py-2 px-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {myProducts.map((p) => {
                  const categoryName = categories.find((c) => c.id === p.category_id)?.name || '—';
                  return (
                    <tr key={p.id} className="border-b border-white/10 text-white/80">
                      <td className="py-3 px-3 flex items-center gap-2">
                        <img src={p.thumbnail} className="w-10 h-10 object-cover rounded" alt={p.name} />
                        {p.name}
                      </td>
                      <td className="py-3 px-3 capitalize">{categoryName}</td>
                      <td className="py-3 px-3">
                        {p.original_price && p.original_price > p.price ? (
                          <div>
                            <span className="line-through text-white/50 mr-1">${p.original_price}</span>
                            <span className="text-white font-bold">${p.price}</span>
                          </div>
                        ) : (
                          <span>${p.price}</span>
                        )}
                      </td>
                      <td className="py-3 px-3">{p.stock_quantity ?? p.stock}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-1 text-sm rounded-full ${
                          p.status === 'approved'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-yellow-500/20 text-yellow-300'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex gap-2">
                          <button onClick={() => handleEdit(p)} className="glass-button px-3 py-1">Edit</button>
                          <button onClick={() => handleDelete(p.id)} className="glass-button px-3 py-1 text-red-400">Delete</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Product Form */}
            {modalProduct !== null && (
              <div className="mt-8 bg-black/50 p-4 rounded-lg">
                <h3 className="text-xl text-white mb-4">{form.id ? 'Edit' : 'Add'} Product</h3>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input name="name" value={form.name} onChange={handleInputChange} required placeholder="Name" className="glass-input" />
                  <input name="price" value={form.price} onChange={handleInputChange} required placeholder="Price" type="number" className="glass-input" />
                  <input name="original_price" value={form.original_price} onChange={handleInputChange} required placeholder="Original Price" type="number" className="glass-input" />
                  <input name="stock_quantity" value={form.stock_quantity} onChange={handleInputChange} required placeholder="Stock" type="number" className="glass-input" />

                  <select
                    name="category_id"
                    value={form.category_id}
                    onChange={handleInputChange}
                    required
                    className="glass-input"
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>

                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleInputChange}
                    placeholder="Description"
                    className="glass-input md:col-span-2"
                  />

                  <div className="md:col-span-2">
                    <label className="text-white block mb-2">Thumbnail</label>
                    <input type="file" accept="image/*,video/*" onChange={handleFileChange} className="glass-input" />
                    {uploadPreview && (
                      <div className="mt-2">
                        {form.thumbnail?.type?.includes('video') ? (
                          <video src={uploadPreview} controls className="w-32 rounded" />
                        ) : (
                          <img src={uploadPreview} className="w-32 rounded" />
                        )}
                      </div>
                    )}
                  </div>

                  <div className="md:col-span-2 flex justify-end gap-4 mt-4">
                    <button type="button" onClick={resetForm} className="glass-button">Cancel</button>
                    <button type="submit" className="glass-button-primary">
                      {form.id ? 'Update' : 'Add'} Product
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
