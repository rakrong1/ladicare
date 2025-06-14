import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingCart, ArrowDown } from 'lucide-react';
import { useProducts } from './ProductContext';
import { useCart } from './CartContext';

const Home = () => {
  const { products, categories, loading } = useProducts();
  const { addItem } = useCart();

  const featuredProducts = products.slice(0, 6);

  const handleAddToCart = (product: any) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 via-blue-900/50 to-indigo-900/50"></div>
        
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
          <h1 className="font-display text-6xl md:text-8xl font-bold text-white mb-6 animate-fade-in text-shadow">
            Discover Your
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent block">
              Natural Beauty
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-white/90 mb-8 animate-slide-in-left">
            Premium skincare and beauty products crafted with the finest ingredients 
            to enhance your natural radiance.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-in-right">
            <Link
              to="/products"
              className="glass-button-primary px-8 py-4 text-lg font-semibold hover-lift inline-flex items-center gap-2"
            >
              Shop Now
              <ShoppingCart className="w-5 h-5" />
            </Link>
            <Link
              to="/about"
              className="glass-button px-8 py-4 text-lg font-semibold hover-lift"
            >
              Learn More
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-float">
          <ArrowDown className="w-6 h-6 text-white/60" />
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 px-4">
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
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/products?category=${category.id}`}
                className="glass-card p-6 text-center hover-lift card-3d group"
              >
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-2xl">
                  🌟
                </div>
                <h3 className="font-semibold text-xl text-white mb-2 group-hover:text-purple-300 transition-colors">
                  {category.name}
                </h3>
                <p className="text-white/70 mb-4">{category.description}</p>
                <span className="text-purple-300 font-medium">
                  {category.productCount} products
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4 animate-fade-in">
              Featured Products
            </h2>
            <p className="text-xl text-white/80 animate-fade-in">
              Discover our most loved products
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 stagger-children">
            {featuredProducts.map((product) => (
              <div
                key={product.id}
                className="glass-card overflow-hidden hover-lift product-card-tilt group"
              >
                <div className="aspect-w-16 aspect-h-12 bg-gradient-to-br from-purple-200 to-pink-200 rounded-t-2xl overflow-hidden">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                
                <div className="p-6">
                  <h3 className="font-semibold text-lg text-white mb-2 group-hover:text-purple-300 transition-colors">
                    {product.name}
                  </h3>
                  
                  <p className="text-white/70 text-sm mb-4 line-clamp-2">
                    {product.description}
                  </p>
                  
                  <div className="flex items-center mb-4">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(product.rating)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-400'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-white/60 text-sm ml-2">
                      ({product.reviewCount})
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-white">
                      ${product.price}
                    </span>
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="glass-button-primary px-4 py-2 button-3d ripple"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/products"
              className="glass-button-primary px-8 py-4 text-lg font-semibold hover-lift inline-flex items-center gap-2"
            >
              View All Products
              <ArrowDown className="w-5 h-5 rotate-90" />
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4 animate-fade-in">
              Why Choose Ladicare?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 stagger-children">
            <div className="glass-card p-8 text-center hover-lift">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-2xl">
                ✨
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Premium Quality</h3>
              <p className="text-white/70">
                All our products are carefully selected and tested to ensure the highest quality standards.
              </p>
            </div>

            <div className="glass-card p-8 text-center hover-lift">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-2xl">
                🚚
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Fast Shipping</h3>
              <p className="text-white/70">
                Quick and secure delivery to your doorstep with tracking information provided.
              </p>
            </div>

            <div className="glass-card p-8 text-center hover-lift">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-2xl">
                💝
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Customer Care</h3>
              <p className="text-white/70">
                Dedicated customer support team ready to help with any questions or concerns.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
