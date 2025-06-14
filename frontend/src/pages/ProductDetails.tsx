import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Star, ShoppingCart, Check } from 'lucide-react';
import { useCart } from './CartContext';
import api from '../services/api';
import { Product } from '../types/product';

const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const {
    data,
    isLoading,
    isError
  } = useQuery({
    queryKey: ['product', id],
    queryFn: () => api.get(`/products/${id}`),
    enabled: !!id
  });

  const product: Product | undefined = data?.data;

  if (isLoading) {
    return (
      <div className="pt-32 text-center text-white">Loading product...</div>
    );
  }

  if (isError || !product) {
    return (
      <div className="pt-24 pb-12 px-4 min-h-screen">
        <div className="max-w-4xl mx-auto text-center py-20">
          <div className="glass-card p-12">
            <h2 className="text-3xl font-bold text-white mb-4">Product Not Found</h2>
            <p className="text-white/70 mb-8">
              The product you're looking for doesn't exist or has been removed.
            </p>
            <button
              onClick={() => navigate('/products')}
              className="glass-button-primary px-8 py-3"
            >
              Back to Products
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0] || '',
    });
    setQuantity(1);
  };

  return (
    <div className="pt-24 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <nav className="mb-8 animate-fade-in">
          <div className="flex items-center space-x-2 text-white/60">
            <button onClick={() => navigate('/')} className="hover:text-purple-300">
              Home
            </button>
            <span>/</span>
            <button onClick={() => navigate('/products')} className="hover:text-purple-300">
              Products
            </button>
            <span>/</span>
            <span className="text-white">{product.name}</span>
          </div>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="animate-slide-in-left">
            <div className="glass-card p-6 mb-6">
              <div className="aspect-w-16 aspect-h-12 mb-6 rounded-2xl overflow-hidden bg-gradient-to-br from-purple-200 to-pink-200">
                <img
                  src={product.images?.[selectedImage] || ''}
                  alt={product.name}
                  className="w-full h-96 object-cover hover-scale"
                />
              </div>

              {/* Image Thumbnails */}
              {product.images?.length > 1 && (
                <div className="flex gap-3">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage === index
                          ? 'border-purple-400'
                          : 'border-white/20 hover:border-white/40'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="animate-slide-in-right">
            <div className="glass-card p-8 mb-6">
              <h1 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(product.rating || 0)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-400'
                    }`}
                  />
                ))}
                <span className="text-white/80 ml-2">
                  {product.rating || 0} ({product.reviewCount || 0} reviews)
                </span>
              </div>

              {/* Price */}
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">GHS {product.price}</span>
              </div>

              {/* Description */}
              <p className="text-white/80 text-lg mb-6 leading-relaxed">
                {product.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {(product.tags || []).map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-white/10 rounded-full text-sm text-white/80 border border-white/20"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Key Features (optional field) */}
              {product.features?.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-white mb-4">Key Features</h3>
                  <ul className="space-y-2">
                    {product.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-white/80">
                        <Check className="w-5 h-5 text-green-400 mr-3" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Quantity and Add to Cart */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center glass-card p-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="glass-button p-2 text-sm"
                  >
                    -
                  </button>
                  <span className="text-white font-medium px-4 min-w-[3rem] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="glass-button p-2 text-sm"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="glass-button-primary px-8 py-4 flex-1 font-semibold hover-lift flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Add to Cart - GHS {(product.price * quantity).toFixed(2)}
                </button>
              </div>

              <div className="flex items-center text-green-400 mb-6">
                <Check className="w-5 h-5 mr-2" />
                <span>{product.stock_quantity || 0} items in stock</span>
              </div>

              {/* Info */}
              <div className="border-t border-white/20 pt-6 space-y-3 text-sm text-white/70">
                <p>✅ Free shipping on orders over GHS 200</p>
                <p>🔄 30-day return policy</p>
                <p>🔒 Secure payment</p>
                <p>🚚 Delivery within 2-4 business days</p>
              </div>
            </div>
          </div>
        </div>

        {/* You can later add real reviews here */}
      </div>
    </div>
  );
};

export default ProductDetails;
