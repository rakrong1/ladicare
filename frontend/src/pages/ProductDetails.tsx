import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Star, ShoppingCart, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCart } from './CartContext';
import api from '../services/api';
import { Product } from '../types/product';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem, state } = useCart();

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [liveStock, setLiveStock] = useState<number>(0);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['product', id],
    queryFn: () => api.get(`/products/${id}`),
    enabled: !!id,
  });

  const product: Product | undefined = data?.data;

  const getImageUrl = (img?: string) =>
    img ? `${BACKEND_URL}/uploads/${img}` : '/placeholder.png';

  // 🧠 Live Stock Check
  useEffect(() => {
    if (product) {
      const cartQty = state.items.find(i => i.id === product.id)?.quantity || 0;
      setLiveStock(Math.max(0, (product.stock_quantity || 0) - cartQty));
    }
  }, [state.items, product]);

  if (isLoading) {
    return <div className="pt-32 text-center text-white">Loading product...</div>;
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
            <button onClick={() => navigate('/products')} className="glass-button-primary px-8 py-3">
              Back to Products
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (liveStock < quantity) return;
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: getImageUrl(product.thumbnail || product.images?.[0]),
    });
    setQuantity(1);
  };

  const canAdd = quantity <= liveStock;

  return (
    <div className="pt-24 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <nav className="mb-8 animate-fade-in">
          <div className="flex items-center space-x-2 text-white/60">
            <button onClick={() => navigate('/')} className="hover:text-purple-300">Home</button>
            <span>/</span>
            <button onClick={() => navigate('/products')} className="hover:text-purple-300">Products</button>
            <span>/</span>
            <span className="text-white">{product.name}</span>
          </div>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Images */}
          <div className="animate-slide-in-left">
            <div className="glass-card p-6 mb-6">
              <div className="relative">
                <img
                  src={getImageUrl(product.images?.[selectedImage] || product.thumbnail)}
                  alt={product.name}
                  className="w-full h-96 object-cover rounded-2xl"
                />
                {product.images?.length > 1 && (
                  <>
                    <button
                      onClick={() => setSelectedImage(prev => (prev > 0 ? prev - 1 : product.images!.length - 1))}
                      className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white rounded-full p-2"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={() => setSelectedImage(prev => (prev + 1) % product.images!.length)}
                      className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white rounded-full p-2"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}
              </div>

              {product.images?.length > 1 && (
                <div className="flex gap-3 mt-4 overflow-x-auto">
                  {product.images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage === index
                          ? 'border-purple-400'
                          : 'border-white/20 hover:border-white/40'
                      }`}
                    >
                      <img src={getImageUrl(img)} alt={`Image ${index + 1}`} className="w-full h-full object-cover" />
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
                <span className="text-4xl font-bold text-white">
                  GHS {Number(product.price).toFixed(2)}
                </span>
                {product.original_price && Number(product.original_price) > Number(product.price) && (
                  <span className="text-white/50 line-through ml-4 text-xl">
                    GHS {Number(product.original_price).toFixed(2)}
                  </span>
                )}
              </div>

              <p className="text-white/80 text-lg mb-6 leading-relaxed">{product.description}</p>

              {/* Tags */}
              {!!product.tags?.length && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {product.tags.map((tag) => (
                    <span key={tag} className="px-3 py-1 bg-white/10 rounded-full text-sm text-white/80 border border-white/20">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Features */}
              {!!product.features?.length && (
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
                    disabled={!canAdd}
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={!canAdd}
                  className="glass-button-primary px-8 py-4 flex-1 font-semibold hover-lift flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Add to Cart – GHS {(product.price * quantity).toFixed(2)}
                </button>
              </div>

              <div className={`flex items-center mb-6 ${
                liveStock <= 0 ? 'text-red-400' :
                liveStock <= 3 ? 'text-yellow-400' : 'text-green-400'
              }`}>
                <Check className="w-5 h-5 mr-2" />
                <span>
                  {liveStock <= 0
                    ? 'Out of Stock'
                    : liveStock <= 3
                    ? `Only ${liveStock} left!`
                    : `${liveStock} items in stock`}
                </span>
              </div>


              {/* Info */}
              <div className="border-t border-white/20 pt-6 space-y-3 text-sm text-white/70">
                <p>✅ Free shipping on orders over GHS 200</p>
                <p>🔄 30-day return policy</p>
                <p>🔒 Secure payment</p>
                <p>🚚 Delivery within 1-4 business days</p>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section – TODO */}
      </div>
    </div>
  );
};

export default ProductDetails;
