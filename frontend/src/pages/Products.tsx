import React, { useEffect, useState } from 'react';
import { useProducts } from './ProductContext';
import { useCart } from './CartContext';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const Products = () => {
  const {
    visibleProducts,
    categories,
    loading,
    error,
    searchProducts,
  } = useProducts();

  const { addItem } = useCart();

  const [query, setQuery] = useState('');
  const [filtered, setFiltered] = useState(visibleProducts);

  useEffect(() => {
    setFiltered(query.trim() ? searchProducts(query) : visibleProducts);
  }, [query, visibleProducts]);

  if (loading) return <p className="text-white text-center mt-20">Loading products...</p>;
  if (error) return <p className="text-red-400 text-center mt-20">{error}</p>;

  return (
    <div className="pt-24 pb-12 px-4 max-w-7xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Our Products</h1>
        <input
          type="text"
          placeholder="Search products..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="glass-input w-full max-w-md mt-4"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.isArray(filtered) && filtered.length > 0 ? (
          filtered.map((product) => {
            const categoryName =
              product.category?.name || categories.find((c) => c.id === product.category_id)?.name || 'Uncategorized';

            const thumbnailUrl = product.thumbnail
              ? `${BACKEND_URL}/uploads/${product.thumbnail}`
              : product.images?.[0]
              ? `${BACKEND_URL}/uploads/${product.images[0]}`
              : '/placeholder.png';

            const stockText =
              !product.stock_quantity || product.stock_quantity <= 0
                ? 'Out of Stock'
                : product.stock_quantity <= 3
                ? `Only ${product.stock_quantity} left!`
                : `In Stock: ${product.stock_quantity}`;

            const stockColor =
              !product.stock_quantity || product.stock_quantity <= 0
                ? 'text-red-400'
                : product.stock_quantity <= 3
                ? 'text-yellow-400'
                : 'text-green-400';

            return (
              <div
                key={product.id}
                className="glass-card p-4 flex flex-col transition-transform duration-200 transform hover:scale-105 hover:cursor-pointer"
              >
                <img
                  src={thumbnailUrl}
                  alt={product.name}
                  className="w-full h-48 object-cover rounded mb-4"
                />
                <h3 className="text-white text-lg font-semibold mb-1">{product.name}</h3>
                <p className="text-white/70 text-sm mb-1">{categoryName}</p>

                {/* Price with discount */}
                <p className="text-white font-bold text-xl mb-1">
                  {product.original_price && Number(product.original_price) > Number(product.price) ? (
                    <>
                      <span className="line-through text-white/50 mr-2">
                        GHS {Number(product.original_price).toFixed(2)}
                      </span>
                      <span>GHS {Number(product.price).toFixed(2)}</span>
                    </>
                  ) : (
                    <>GHS {Number(product.price).toFixed(2)}</>
                  )}
                </p>

                {/* Stock info */}
                <p className={`text-sm mb-3 ${stockColor}`}>{stockText}</p>

                <button
  className="glass-button w-full py-2 mt-auto disabled:opacity-50 disabled:cursor-not-allowed"
  onClick={() =>
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: thumbnailUrl,
    })
  }
  disabled={product.stock_quantity === 0}
>
  {product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
</button>

              </div>
            );
          })
        ) : (
          <p className="text-white/70 text-center col-span-full">No products found.</p>
        )}
      </div>
    </div>
  );
};

export default Products;
