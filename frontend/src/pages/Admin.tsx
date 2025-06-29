import React, { useState } from 'react';
import { useProducts } from './ProductContext';
import api from '@/services/api';
import { useAuth } from './AuthContext';
import AuthModal from '@/components/auth/AuthModal';

const Admin = () => {
  const { products, categories, refetchProducts } = useProducts();
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
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
    if (!user) return setShowAuthModal(true);

    const payload = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value !== null) payload.append(key, value);
    });
    payload.append('sellerId', user.id);

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

  if (!user) return <AuthModal open={true} onClose={() => setShowAuthModal(false)} />;

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

            {/* ...product table and form remains the same... */}

          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
