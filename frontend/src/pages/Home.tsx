import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingCart, ArrowDown } from 'lucide-react';
import { useProducts } from './ProductContext';
import { useCart } from './CartContext';
import { useAuth } from './AuthContext';
import AuthModal from '@/components/auth/AuthModal';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const Home = () => {
  const { visibleProducts, categories, loading } = useProducts();
  const { isAuthenticated } = useAuth();
  const { state: cartState, addItem } = useCart();

  const [showAuthModal, setShowAuthModal] = useState(false);

  const featuredProducts = visibleProducts.filter(p => p.is_featured);

  const getProductQuantityInCart = (productId: string) => {
    const item = cartState.items.find(i => i.id === productId);
    return item ? item.quantity : 0;
  };

  const handleAddToCart = (product: any) => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    const currentQtyInCart = getProductQuantityInCart(product.id);
    if (product.stock_quantity <= currentQtyInCart) return;

    const imageUrl = product.thumbnail
      ? `${BACKEND_URL}/uploads/${product.thumbnail}`
      : product.images?.[0]
      ? `${BACKEND_URL}/uploads/${product.images[0]}`
      : '/placeholder.png';

    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: imageUrl,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <div className="pt-2">
      {/* 🔐 Auth Modal */}
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}

      {/* Hero Section */}
      <section className="relative flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 via-blue-900/50 to-indigo-900/50" />
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
          <h1 className="font-display pt-40 md:pt-60 text-5xl md:text-8xl font-bold text-white mb-6 animate-fade-in text-shadow">
            Discover Your
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent block">
              Natural Beauty
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 animate-slide-in-left">
            Premium skincare and beauty products crafted to enhance your natural radiance.
          </p>
          <div className="flex pt-10 md:pt-20 mb-16 gap-4 justify-center animate-slide-in-right">
            <Link to="/products" className="glass-button-primary px-8 py-4 text-lg font-semibold hover-lift inline-flex items-center gap-2 cursor-pointer">
              Shop Now <ShoppingCart className="w-5 h-5" />
            </Link>
            <Link to="/about" className="glass-button px-8 py-4 text-lg font-semibold hover-lift cursor-pointer">
              Learn More
            </Link>
          </div>
        </div>
        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 animate-float">
          <ArrowDown className="w-6 h-6 text-white/60" />
        </div>
      </section>

      {/* Categories */}
      <section className="py-2 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4 animate-fade-in">
              Shop by Category
            </h2>
            <p className="text-xl text-white/80 animate-fade-in">
              Explore our curated collection of beauty essentials
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 stagger-children">
            {categories.length ? (
              categories.map(category => (
                <Link
                  key={category.id}
                  to={`/products?category=${category.id}`}
                  className="glass-card p-6 text-center hover-lift card-3d group cursor-pointer"
                >
                  <h3 className="font-semibold text-xl text-white mb-2 group-hover:text-purple-300 transition-colors">
                    {category.name}
                  </h3>
                </Link>
              ))
            ) : (
              <p className="text-white/60 col-span-full text-center">No categories available.</p>
            )}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-0 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4 animate-fade-in">
              Featured Products
            </h2>
            <p className="text-xl text-white/80 animate-fade-in">Discover our most loved products</p>
          </div>

          {featuredProducts.length === 0 ? (
            <p className="text-white/70 text-center">No featured products at the moment.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 stagger-children">
              {featuredProducts.map(product => {
                const imageUrl = product.thumbnail
                  ? `${BACKEND_URL}/uploads/${product.thumbnail}`
                  : product.images?.[0]
                  ? `${BACKEND_URL}/uploads/${product.images[0]}`
                  : '/placeholder.png';

                const inCartQty = getProductQuantityInCart(product.id);
                const remainingQty = (product.stock_quantity || 0) - inCartQty;
                const isOutOfStock = remainingQty <= 0;

                const stockText = isOutOfStock
                  ? 'Out of Stock'
                  : remainingQty <= 3
                  ? `Only ${remainingQty} left!`
                  : `In Stock: ${remainingQty}`;

                const stockColor = isOutOfStock
                  ? 'text-red-400'
                  : remainingQty <= 3
                  ? 'text-yellow-400'
                  : 'text-green-400';

                return (
                  <div key={product.id} className="glass-card overflow-hidden hover-lift product-card-tilt group cursor-pointer">
                    <Link
                      to={`/products/${product.id}`}
                      className="aspect-w-16 aspect-h-12 bg-gradient-to-br from-purple-200 to-pink-200 rounded-t-2xl overflow-hidden block"
                    >
                      <img
                        src={imageUrl}
                        alt={product.name}
                        className="w-full h-65 object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </Link>

                    <div className="p-6">
                      <h3 className="font-semibold text-lg text-white mb-2 group-hover:text-purple-300 transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-white/70 text-sm mb-4 line-clamp-2">{product.description}</p>
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
                        <span className="text-white/60 text-sm ml-2">({product.reviewCount || 0})</span>
                      </div>
                      <div className="mb-2">
                        <span className="text-2xl font-bold text-white">GHS {Number(product.price).toFixed(2)}</span>
                        {product.original_price && Number(product.original_price) > Number(product.price) && (
                          <span className="text-white/50 line-through text-sm ml-2">GHS {Number(product.original_price).toFixed(2)}</span>
                        )}
                      </div>
                      <div className={`text-sm mb-4 ${stockColor}`}>{stockText}</div>
                      <button
                        className="glass-button w-full py-2 mt-auto disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => handleAddToCart(product)}
                        disabled={isOutOfStock}
                      >
                        {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              to="/products"
              className="glass-button-primary px-8 py-4 text-lg font-semibold hover-lift inline-flex items-center gap-2 cursor-pointer"
            >
              View All Products
              <ArrowDown className="w-5 h-5 rotate-90" />
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4 animate-fade-in">Why Choose Ladicare?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 stagger-children">
            {[
              { icon: '✨', title: 'Premium Quality', desc: 'Top-tier ingredients. Exceptional results.' },
              { icon: '🚚', title: 'Fast Shipping', desc: 'Quick, tracked delivery to your door.' },
              { icon: '💝', title: 'Customer Care', desc: 'Friendly, helpful support whenever you need it.' }
            ].map((item, i) => (
              <div key={i} className="glass-card p-8 text-center hover-lift cursor-pointer">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-2xl">
                  {item.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">{item.title}</h3>
                <p className="text-white/70">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
