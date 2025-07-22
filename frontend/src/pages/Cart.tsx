import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingCart } from 'lucide-react';
import { useCart } from './CartContext';
import api from '@/services/api';

interface CartItem {
  id: number;
  productId: string;  // Add this
  name: string;
  image: string;
  price: number;
  quantity: number;  // Make this required
  stock_quantity?: number;
  variant_id?: number | null;
}

const Cart = () => {
  const { state, removeItem, updateQuantity, clearCart } = useCart();
  const [liveStock, setLiveStock] = useState<Record<number, number>>({});

  // Safe number conversion utility
  const safeNumber = (value: unknown, fallback = 0): number => {
    const num = Number(value);
    return isNaN(num) ? fallback : num;
  };

  // Calculate safe totals
  const safeTotal = safeNumber(state.total);
  const safeItemCount = safeNumber(state.itemCount);
  const taxAmount = safeTotal * 0.08;
  const grandTotal = safeTotal + taxAmount;

  // Format price as GHS
  const formatPrice = (amount: number): string => {
    return amount.toLocaleString('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Sync with live stock data
  useEffect(() => {
    if (state.items.length === 0) return;

    const fetchLiveStock = async () => {
      try {
        const response = await api.get('/products/stock');
        const stockData = response.data?.data ?? response.data ?? {};
        
        const stockMap: Record<number, number> = {};
        Object.entries(stockData).forEach(([id, qty]) => {
          stockMap[Number(id)] = Math.max(0, Number(qty) || 0);
        });
        setLiveStock(stockMap);

        // Validate cart quantities against live stock
        for (const item of state.items) {
          const id = Number(item.productId);  // Use productId instead of id
          const availableStock = stockMap[id] ?? 0;
          const currentQty = Number(item.quantity) || 0;

          if (availableStock === 0 && currentQty > 0) {
            await removeItem(String(id));
          } else if (currentQty > availableStock) {
            await updateQuantity(String(id), null, availableStock);
          }
        }
      } catch (err) {
        console.error('Failed to sync cart with live stock:', err);
      }
    };

    fetchLiveStock();
  }, [state.items, removeItem, updateQuantity]);  // Add proper dependencies

  // Handle quantity change
  const handleQuantityChange = async (productId: string, newQuantity: number) => {
    const id = Number(productId);
    const validatedQty = Math.max(1, Math.min(
      safeNumber(newQuantity),
      liveStock[id] ?? safeNumber(99)
    ));

    try {
      if (validatedQty < 1) {
        await removeItem(productId);
      } else {
        await updateQuantity(productId, null, validatedQty);
      }
    } catch (err) {
      console.error('Failed to update quantity:', err);
    }
  };

  // Show empty cart UI
  if (state.items.length === 0) {
    return (
      <div className="pt-24 pb-12 px-4 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-20">
            <div className="glass-card p-12 max-w-md mx-auto animate-fade-in-scale">
              <ShoppingCart className="w-20 h-20 mx-auto mb-6 text-white/40" />
              <h2 className="text-3xl font-bold text-white mb-4">Your cart is empty</h2>
              <p className="text-white/70 mb-8">Looks like you haven't added any products yet.</p>
              <Link 
                to="/products" 
                className="glass-button-primary px-8 py-3 inline-flex items-center gap-2 hover-lift cursor-pointer"
              >
                <ShoppingCart className="w-5 h-5" />
                Start Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-12 px-4 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4 animate-fade-in">
            Shopping Cart
          </h1>
          <p className="text-xl text-white/80 animate-fade-in">Review your items before checkout</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="glass-card p-6 animate-fade-in-scale">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-white">
                  Cart Items ({safeItemCount})
                </h2>
                <button 
                  onClick={clearCart} 
                  className="glass-button px-4 py-2 text-sm hover-lift cursor-pointer"
                >
                  Clear All
                </button>
              </div>

              <div className="space-y-4">
                {state.items.map((item, index) => {
                  const id = Number(item.productId);  // Use productId instead of id
                  const safeItemPrice = safeNumber(item.price);
                  const safeItemQty = safeNumber(item.quantity);
                  const maxQty = liveStock[id] ?? safeNumber(item.stock_quantity, 99);
                  const isMax = safeItemQty >= maxQty;
                  const isOutOfStock = maxQty === 0;

                  return (
                    <div
                      key={`${item.productId}-${item.variant_id ?? 'v'}`}
                      className="glass-card p-4 flex items-center gap-4 hover-lift cursor-default"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-gradient-to-br from-purple-200 to-pink-200">
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-full h-full object-cover" 
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder-product.jpg';
                          }}
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-white mb-1">
                          {item.name || 'Unnamed Product'}
                        </h3>
                        <p className="text-purple-300 font-medium">
                          {formatPrice(safeItemPrice)}
                        </p>
                        {isOutOfStock ? (
                          <p className="text-red-400 text-sm mt-1">Out of Stock</p>
                        ) : isMax ? (
                          <p className="text-yellow-400 text-sm mt-1">
                            Only {maxQty} in stock
                          </p>
                        ) : null}
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleQuantityChange(item.productId, safeItemQty - 1)}
                          className="glass-button p-2 hover-lift cursor-pointer"
                          disabled={isOutOfStock}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="text-white font-medium min-w-[2rem] text-center">
                          {safeItemQty}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item.productId, safeItemQty + 1)}
                          disabled={isOutOfStock || isMax}
                          className={`glass-button p-2 hover-lift cursor-pointer ${
                            isOutOfStock || isMax ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-semibold">
                          {formatPrice(safeItemPrice * safeItemQty)}
                        </p>
                      </div>
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="glass-button p-2 hover-lift text-red-400 hover:text-red-300 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="glass-card p-6 animate-slide-in-right sticky top-24">
              <h2 className="text-2xl font-semibold text-white mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-white/80">
                  <span>Subtotal ({safeItemCount} items)</span>
                  <span>{formatPrice(safeTotal)}</span>
                </div>
                <div className="flex justify-between text-white/80">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between text-white/80">
                  <span>Tax (8%)</span>
                  <span>{formatPrice(taxAmount)}</span>
                </div>
                <div className="border-t border-white/20 pt-4">
                  <div className="flex justify-between text-xl font-semibold text-white">
                    <span>Total</span>
                    <span>{formatPrice(grandTotal)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Link 
                  to="/checkout" 
                  className="glass-button-primary w-full py-4 text-center font-semibold hover-lift block cursor-pointer"
                >
                  Proceed to Checkout
                </Link>
                <Link 
                  to="/products" 
                  className="glass-button w-full py-3 text-center hover-lift block cursor-pointer"
                >
                  Continue Shopping
                </Link>
              </div>

              <div className="mt-6 pt-6 border-t border-white/20 text-center text-white/70 text-sm">
                <p className="mb-2">🔒 Secure Checkout</p>
                <p>SSL encrypted payment processing</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;