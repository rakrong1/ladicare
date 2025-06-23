import React from 'react';
import { Star } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ProductCard = ({ product, stock, onAdd }) => {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

  const imageUrl = product.thumbnail
    ? `${BACKEND_URL}/uploads/${product.thumbnail}`
    : product.images?.[0]
    ? `${BACKEND_URL}/uploads/${product.images[0]}`
    : '/placeholder.png';

  const isOutOfStock = stock <= 0;
  const stockText = isOutOfStock
    ? 'Out of Stock'
    : stock <= 3
    ? `Only ${stock} left!`
    : `In Stock: ${stock}`;

  const stockColor = isOutOfStock
    ? 'text-red-400'
    : stock <= 3
    ? 'text-yellow-400'
    : 'text-green-400';

  return (
    <div className="glass-card overflow-hidden hover-lift product-card-tilt group relative">
      {/* ✅ Link wraps all content except the add-to-cart */}
      <Link to={`/products/${product.id}`} className="block">
        <div className="aspect-w-16 aspect-h-12 bg-gradient-to-br from-purple-200 to-pink-200 rounded-t-2xl overflow-hidden">
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
          />
        </div>
        <div className="p-6">
          <h3 className="font-semibold text-lg text-white mb-2 group-hover:text-purple-300 transition-colors">
            {product.name}
          </h3>
          <p className="text-white/70 text-sm mb-4 line-clamp-2">{product.description}</p>

          <div className="flex items-center mb-3">
            <div className="flex items-center">
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
            </div>
            <span className="text-white/60 text-sm ml-2">
              ({product.reviewCount || 0})
            </span>
          </div>

          <div className="mb-2">
            <span className="text-2xl font-bold text-white">
              GHS {Number(product.price).toFixed(2)}
            </span>
            {product.original_price &&
              Number(product.original_price) > Number(product.price) && (
                <span className="text-white/50 line-through text-sm ml-2">
                  GHS {Number(product.original_price).toFixed(2)}
                </span>
              )}
          </div>

          <div className={`text-sm ${stockColor}`}>{stockText}</div>
        </div>
      </Link>

      {/* ✅ Add to Cart stays outside Link */}
      <div className="px-6 pb-6">
        <button
          className="glass-button w-full py-2 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => onAdd(product)}
          disabled={isOutOfStock}
        >
          {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
};
