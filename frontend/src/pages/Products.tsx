import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Star, ShoppingCart, Search } from 'lucide-react';
import { useCart } from './CartContext';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { Product } from '../types/product.js';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { addItem } = useCart();

  const { data: productRes, isLoading, isError } = useQuery({
    queryKey: ['products'],
    queryFn: () => api.getProducts(),
  });

  const { data: categoryRes } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories'),
  });

  const products: Product[] = productRes?.data || [];
  const categories = categoryRes?.data || [];

  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');

  useEffect(() => {
    let filtered = [...products];

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category?.id?.toString() === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.tags || []).some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        default:
          return a.name.localeCompare(b.name);
      }
    });

    setFilteredProducts(filtered);
  }, [products, selectedCategory, searchQuery, sortBy]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    if (category === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', category);
    }
    setSearchParams(searchParams);
  };

  const handleAddToCart = (product: Product) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0] || '',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (isError) {
    return <div className="text-center text-red-500 mt-20">Failed to load products.</div>;
  }

  return (
    <div className="pt-24 pb-12 px-4">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4 animate-fade-in">
            Our Products
          </h1>
          <p className="text-xl text-white/80 animate-fade-in">
            Discover premium beauty products for every need
          </p>
        </div>

        {/* Filters */}
        <div className="glass-card p-6 mb-8 animate-fade-in-scale">
          <div className="flex flex-col lg:flex-row gap-6 items-center">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="glass-input w-full pl-10 pr-4"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-4 h-4" />
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleCategoryChange('all')}
                className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                  selectedCategory === 'all'
                    ? 'glass-button-primary'
                    : 'glass-button hover-lift'
                }`}
              >
                All Products
              </button>
              {categories.map((category: any) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryChange(category.id.toString())}
                  className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                    selectedCategory === category.id.toString()
                      ? 'glass-button-primary'
                      : 'glass-button hover-lift'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="glass-input min-w-[150px]"
            >
              <option value="name">Sort by Name</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>

        {/* Count */}
        <div className="mb-8">
          <p className="text-white/70">
            Showing {filteredProducts.length} of {products.length} products
          </p>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <div className="glass-card p-12 max-w-md mx-auto">
              <h3 className="text-2xl font-semibold text-white mb-4">No products found</h3>
              <p className="text-white/70 mb-6">
                Try adjusting your search criteria or browse different categories.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="glass-button-primary px-6 py-3"
              >
                Show All Products
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 stagger-children">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="glass-card overflow-hidden hover-lift product-card-tilt group"
              >
                <div className="aspect-w-16 aspect-h-12 bg-gradient-to-br from-purple-200 to-pink-200 rounded-t-2xl overflow-hidden">
                  <img
                    src={product.images?.[0]}
                    alt={product.name}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-lg text-white mb-2 group-hover:text-purple-300 transition-colors line-clamp-1">
                    {product.name}
                  </h3>

                  <p className="text-white/70 text-sm mb-3 line-clamp-2">
                    {product.description}
                  </p>

                  <div className="flex items-center mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(product.rating || 0)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-400'
                        }`}
                      />
                    ))}
                    <span className="text-white/60 text-sm ml-2">
                      ({product.reviewCount || 0})
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {(product.tags || []).slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-white/10 rounded-full text-xs text-white/80"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-white">
                      GHS {product.price}
                    </span>
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="glass-button-primary px-3 py-2 text-sm button-3d ripple flex items-center gap-1"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
