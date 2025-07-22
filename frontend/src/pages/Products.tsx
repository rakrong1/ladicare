import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useProducts } from './ProductContext';
import { useCart } from './CartContext';
import { useAuth } from './AuthContext';
import api from '@/services/api';
import { ProductCard } from '@/components/ProductCard';
import { useKeenSlider } from 'keen-slider/react';
import 'keen-slider/keen-slider.min.css';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
const PAGE_SIZE = 9;

// Define proper types
interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  original_price?: number;
  thumbnail?: string;
  images?: string[];
  rating?: number;
  reviewCount?: number;
  stock_quantity?: number;
  category_id: number;
  tags?: string[];
}

interface RecentViewedProduct extends Product {}

const Products = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const selectedCategory = params.get('category');

  const { visibleProducts, categories, loading, error } = useProducts();
  const { addItem, upsertItem, state: cartState } = useCart();
  const { isAuthenticated, openModal } = useAuth();

  const [query, setQuery] = useState('');
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'priceAsc' | 'priceDesc' | 'popular'>('popular');
  const [currentPage, setCurrentPage] = useState(1);

  const [filtered, setFiltered] = useState<Product[]>(visibleProducts);
  const [liveStock, setLiveStock] = useState<Record<number, number>>({});
  const [recentlyViewed, setRecentlyViewed] = useState<RecentViewedProduct[]>([]);
  const [suggestions, setSuggestions] = useState<Product[]>([]);

  const [rvRef, rvInstance] = useKeenSlider<HTMLDivElement>({ slides: { perView: 4, spacing: 16 } });
  const [sgRef, sgInstance] = useKeenSlider<HTMLDivElement>({ slides: { perView: 4, spacing: 16 } });

  // 🧠 Filter products by category, query, tags
  useEffect(() => {
    let list = [...visibleProducts];

    if (selectedCategory) {
      list = list.filter((p) => String(p.category_id) === selectedCategory);
    }
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }
    if (tagFilter) {
      list = list.filter((p) => p.tags?.includes(tagFilter));
    }

    if (sortBy === 'priceAsc') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'priceDesc') {
      list.sort((a, b) => b.price - a.price);
    } else {
      list.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
    }

    setFiltered(list);
    setCurrentPage(1); // reset pagination
  }, [selectedCategory, query, tagFilter, sortBy, visibleProducts]);

  // 📦 Fetch live stock data
  useEffect(() => {
    const fetchStock = async () => {
      try {
        const response = await api.get('/products/stock');
        const stockMap: Record<number, number> = {};
        if (response.data?.success && response.data.data) {
          Object.entries(response.data.data).forEach(([id, qty]) => {
            stockMap[Number(id)] = qty;
          });
        }
        setLiveStock(stockMap);
      } catch (e) {
        console.error('❌ Stock fetch error:', e);
      }
    };
    fetchStock();
  }, []);

  // 🛒 Add to cart handler
  const handleAddToCart = async (product: Product) => {
    if (!isAuthenticated) return openModal();

    const id = Number(product.id);
    const stock = liveStock[id] ?? product.stock_quantity ?? 0;

    if (stock <= 0) return;

    try {
      await upsertItem(
        String(id),
        undefined,
        1,
        Number(product.price || 0)
      );

      // Update local stock
      setLiveStock(prev => ({
        ...prev,
        [id]: Math.max(0, (prev[id] ?? stock) - 1)
      }));

      // Update recently viewed
      const updatedRV = [
        product,
        ...recentlyViewed.filter(r => r.id !== id)
      ].slice(0, 5);
      
      localStorage.setItem('rv', JSON.stringify(updatedRV));
      setRecentlyViewed(updatedRV);
    } catch (err) {
      console.error('Failed to add to cart:', err);
    }
  };

  // 👁️ Recently viewed + suggestions
  useEffect(() => {
    const rv = JSON.parse(localStorage.getItem('rv') || '[]') as RecentViewedProduct[];
    setRecentlyViewed(rv);

    if (rv.length) {
      const catId = rv[0].category_id;
      const suggest = visibleProducts
        .filter((p) => p.category_id === catId && !rv.find((r) => r.id === p.id))
        .slice(0, 6);
      setSuggestions(suggest);
    } else {
      setSuggestions([]);
    }
  }, [visibleProducts]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const currentCategory = selectedCategory
    ? categories.find((c) => String(c.id) === selectedCategory)?.name
    : null;

  const displayItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // 💬 UI START
  if (loading) return <p className="text-white text-center mt-20">Loading products...</p>;
  if (error) return <p className="text-red-400 text-center mt-20">{error}</p>;

  return (
    <div className="pt-24 pb-12 px-4 max-w-7xl mx-auto space-y-12">
      {/* 🔍 Filters */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
        <h1 className="text-4xl font-bold text-white">
          {currentCategory ? `Products in ${currentCategory}` : 'All Products'}
        </h1>
        <div className="flex flex-wrap gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="glass-input text-white"
          >
            <option value="popular">Most Popular</option>
            <option value="priceAsc">Price: Low to High</option>
            <option value="priceDesc">Price: High to Low</option>
          </select>
          <select
            value={tagFilter || ''}
            onChange={(e) => setTagFilter(e.target.value || null)}
            className="glass-input text-white"
          >
            <option value="">All Tags</option>
            {Array.from(new Set(visibleProducts.flatMap((p) => p.tags || []))).map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="glass-input text-white"
          />
        </div>
      </div>

      {/* 🛍️ Products */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 stagger-children">
        {displayItems.length ? (
          displayItems.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              stock={liveStock[p.id] ?? p.stock_quantity ?? 0}
              onAdd={handleAddToCart}
            />
          ))
        ) : (
          <p className="text-white/70 col-span-full text-center">No products found for this filter.</p>
        )}
      </div>

      {/* 📄 Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button onClick={() => setCurrentPage((p) => p - 1)} disabled={currentPage === 1} className="glass-button px-4">
            Prev
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`glass-button px-4 ${currentPage === i + 1 ? 'bg-purple-600' : ''}`}
            >
              {i + 1}
            </button>
          ))}
          <button onClick={() => setCurrentPage((p) => p + 1)} disabled={currentPage === totalPages} className="glass-button px-4">
            Next
          </button>
        </div>
      )}

      {/* 👀 Recently Viewed */}
      {recentlyViewed.length > 0 && (
        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">Recently Viewed</h2>
          <div className="relative">
            <div ref={rvRef} className="keen-slider">
              {recentlyViewed.map((p) => (
                <div key={p.id} className="keen-slider__slide px-1">
                  <ProductCard product={p} stock={liveStock[p.id] ?? p.stock_quantity ?? 0} onAdd={handleAddToCart} />
                </div>
              ))}
            </div>
            <button
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full"
              onClick={() => rvInstance.current?.prev()}
            >
              ◀
            </button>
            <button
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full"
              onClick={() => rvInstance.current?.next()}
            >
              ▶
            </button>
          </div>
        </section>
      )}

      {/* 🤝 Suggestions */}
      {suggestions.length > 0 && (
        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">You May Also Like</h2>
          <div className="relative">
            <div ref={sgRef} className="keen-slider">
              {suggestions.map((p) => (
                <div key={p.id} className="keen-slider__slide px-1">
                  <ProductCard product={p} stock={liveStock[p.id] ?? p.stock_quantity ?? 0} onAdd={handleAddToCart} />
                </div>
              ))}
            </div>
            <button
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full"
              onClick={() => sgInstance.current?.prev()}
            >
              ◀
            </button>
            <button
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full"
              onClick={() => sgInstance.current?.next()}
            >
              ▶
            </button>
          </div>
        </section>
      )}
    </div>
  );
};

export default Products;