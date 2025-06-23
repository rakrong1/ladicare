import React, { useEffect, useState } from 'react';
import { useProducts } from './ProductContext';
import { useCart } from './CartContext';
import { useLocation } from 'react-router-dom';
import api from '@/services/api';
import { ProductCard } from '@/components/ProductCard';
import { useKeenSlider } from 'keen-slider/react';
import 'keen-slider/keen-slider.min.css';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
const PAGE_SIZE = 9;

const Products = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const selectedCategory = params.get('category');

  const { visibleProducts, categories, loading, error, searchProducts } = useProducts();
  const { addItem, state: cartState } = useCart();

  const [query, setQuery] = useState('');
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'priceAsc' | 'priceDesc' | 'popular'>('popular');
  const [currentPage, setCurrentPage] = useState(1);
  const [liveStock, setLiveStock] = useState<Record<string, number>>({});
  const [filtered, setFiltered] = useState(visibleProducts);
  const [recentlyViewed, setRecentlyViewed] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);

  const [rvRef, rvInstance] = useKeenSlider<HTMLDivElement>({
    slides: { perView: 4, spacing: 16 },
    mode: 'free-snap',
    breakpoints: {
      '(max-width: 768px)': { slides: { perView: 2, spacing: 8 } },
      '(max-width: 480px)': { slides: { perView: 1.2, spacing: 6 } },
    }
  });

  const [sgRef, sgInstance] = useKeenSlider<HTMLDivElement>({
    slides: { perView: 4, spacing: 16 },
    mode: 'free-snap',
    breakpoints: {
      '(max-width: 768px)': { slides: { perView: 2, spacing: 8 } },
      '(max-width: 480px)': { slides: { perView: 1.2, spacing: 6 } },
    }
  });

  useEffect(() => {
    let results = query.trim() ? searchProducts(query) : visibleProducts;
    if (selectedCategory) {
      results = results.filter(p =>
        String(p.category_id) === selectedCategory || String(p.category?.id) === selectedCategory
      );
    }
    if (tagFilter) {
      results = results.filter(p => Array.isArray(p.tags) && p.tags.includes(tagFilter));
    }
    setFiltered(results);
    setCurrentPage(1);
  }, [query, visibleProducts, selectedCategory, tagFilter]);

  useEffect(() => {
    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === 'priceAsc') return a.price - b.price;
      if (sortBy === 'priceDesc') return b.price - a.price;
      return (b.reviewCount || 0) - (a.reviewCount || 0);
    });
    setFiltered(sorted);
  }, [sortBy]);

  useEffect(() => {
    const fetchStock = async () => {
      try {
        const res = await api.get('/products');
        const stockMap: Record<string, number> = {};
        res.forEach(p => stockMap[p.id] = p.stock_quantity ?? 0);
        cartState.items.forEach(ci => {
          if (ci.id in stockMap) {
            stockMap[ci.id] = Math.max(0, stockMap[ci.id] - ci.quantity);
          }
        });
        setLiveStock(stockMap);
      } catch (e) {
        console.error('Error fetching stock', e);
      }
    };
    fetchStock();
  }, [cartState.items]);

  const handleAddToCart = (product: any) => {
    const stock = liveStock[product.id] ?? product.stock_quantity ?? 0;
    if (!stock) return;
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.thumbnail
        ? `${BACKEND_URL}/uploads/${product.thumbnail}`
        : product.images?.[0]
          ? `${BACKEND_URL}/uploads/${product.images[0]}`
          : '/placeholder.png'
    });
    setLiveStock(prev => ({ ...prev, [product.id]: Math.max(0, prev[product.id] - 1) }));
    const newView = { ...product };
    localStorage.setItem('rv', JSON.stringify([newView, ...(recentlyViewed.filter(r => r.id !== product.id).slice(0, 4))]));
    setRecentlyViewed([newView, ...recentlyViewed.filter(r => r.id !== product.id)].slice(0, 5));
  };

  useEffect(() => {
    const rv = JSON.parse(localStorage.getItem('rv') || '[]');
    setRecentlyViewed(rv);
    if (rv.length) {
      const cat = rv[0].category_id;
      setSuggestions(visibleProducts.filter(p => p.category_id === cat && !rv.find(r => r.id === p.id)).slice(0, 4));
    } else setSuggestions([]);
  }, [visibleProducts]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const displayItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  if (loading) return <p className="text-white text-center mt-20">Loading products...</p>;
  if (error) return <p className="text-red-400 text-center mt-20">{error}</p>;

  const currentCategory = selectedCategory ? categories.find(c => String(c.id) === selectedCategory)?.name : null;

  return (
    <div className="pt-24 pb-12 px-4 max-w-7xl mx-auto space-y-12">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
        <h1 className="text-4xl font-bold text-white">
          {currentCategory ? `Products in ${currentCategory}` : 'Our Products'}
        </h1>
        <div className="flex gap-2">
          <select value={sortBy} onChange={e => setSortBy(e.target.value as any)} className="glass-input text-white">
            <option value="popular">Most Popular</option>
            <option value="priceAsc">Price: Low to High</option>
            <option value="priceDesc">Price: High to Low</option>
          </select>
          <select value={tagFilter || ''} onChange={e => setTagFilter(e.target.value || null)} className="glass-input text-white">
            <option value="">All Tags</option>
            {Array.from(new Set(visibleProducts.flatMap(p => p.tags || []))).map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
          <input placeholder="Search..." value={query} onChange={e => setQuery(e.target.value)} className="glass-input text-white" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 stagger-children">
        {displayItems.length ? displayItems.map(p => (
          <ProductCard
            key={p.id}
            product={p}
            stock={liveStock[p.id] ?? p.stock_quantity ?? 0}
            onAdd={handleAddToCart}
          />
        )) : (
          <p className="text-white/70 col-span-full text-center">No products found.</p>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button disabled={currentPage === 1} onClick={() => setCurrentPage(cp => cp - 1)} className="glass-button px-3 disabled:opacity-50">Prev</button>
          {[...Array(totalPages)].map((_, i) => (
            <button key={i} className={`glass-button px-3 ${currentPage === i + 1 ? 'bg-purple-600' : ''}`} onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
          ))}
          <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(cp => cp + 1)} className="glass-button px-3 disabled:opacity-50">Next</button>
        </div>
      )}

      {recentlyViewed.length > 0 && (
        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">Recently Viewed</h2>
          <div className="relative">
            <div ref={rvRef} className="keen-slider">
              {recentlyViewed.map(p => (
                <div key={p.id} className="keen-slider__slide px-1">
                  <ProductCard product={p} stock={liveStock[p.id] ?? p.stock_quantity ?? 0} onAdd={handleAddToCart} />
                </div>
              ))}
            </div>
            <button className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full" onClick={() => rvInstance.current?.prev()}>◀</button>
            <button className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full" onClick={() => rvInstance.current?.next()}>▶</button>
          </div>
        </section>
      )}

      {suggestions.length > 0 && (
        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">You May Also Like</h2>
          <div className="relative">
            <div ref={sgRef} className="keen-slider">
              {suggestions.map(p => (
                <div key={p.id} className="keen-slider__slide px-1">
                  <ProductCard product={p} stock={liveStock[p.id] ?? p.stock_quantity ?? 0} onAdd={handleAddToCart} />
                </div>
              ))}
            </div>
            <button className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full" onClick={() => sgInstance.current?.prev()}>◀</button>
            <button className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full" onClick={() => sgInstance.current?.next()}>▶</button>
          </div>
        </section>
      )}
    </div>
  );
};

export default Products;
