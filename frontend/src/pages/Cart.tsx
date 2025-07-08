import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingCart } from 'lucide-react';
import { useCart } from './CartContext';
import api from '@/services/api';

const Cart = () => {
  const { state, removeItem, updateQuantity, clearCart } = useCart();
  const [liveStock, setLiveStock] = useState<{ [id: string]: number }>({});

  // 🔁 Fetch stock from backend
  useEffect(() => {
    const fetchLiveStock = async () => {
      try {
        const response = await api.get('/products');
        const stockMap = {};
        response.forEach((product) => {
          stockMap[product.id] = product.stock_quantity ?? 0;
        });
        setLiveStock(stockMap);

        // 🧠 Adjust cart quantities if above live stock
        state.items.forEach((item) => {
          const available = stockMap[item.id] ?? 0;
          if (item.quantity > available) {
            updateQuantity(item.id, available);
          }
        });
      } catch (err) {
        console.error('Failed to fetch stock:', err);
      }
    };

    fetchLiveStock();
  }, [state.items, updateQuantity]);

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeItem(id);
    } else {
      updateQuantity(id, newQuantity);
    }
  };

  if (state.items.length === 0) {
    return (
      <div className="pt-24 pb-12 px-4 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-20">
            <div className="glass-card p-12 max-w-md mx-auto animate-fade-in-scale">
              <ShoppingCart className="w-20 h-20 mx-auto mb-6 text-white/40" />
              <h2 className="text-3xl font-bold text-white mb-4">Your cart is empty</h2>
              <p className="text-white/70 mb-8">Looks like you haven't added any products to your cart yet.</p>
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
                <h2 className="text-2xl font-semibold text-white">Cart Items ({state.itemCount})</h2>
                <button onClick={clearCart} className="glass-button px-4 py-2 text-sm hover-lift cursor-pointer">
                  Clear All
                </button>
              </div>

              <div className="space-y-4">
                {state.items.map((item, index) => {
                  const maxQty = liveStock[item.id] ?? 0;
                  const isMax = item.quantity >= maxQty;
                  const isOutOfStock = maxQty === 0;

                  return (
                    <div
                      key={item.id}
                      className="glass-card p-4 flex items-center gap-4 hover-lift cursor-default"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-gradient-to-br from-purple-200 to-pink-200">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>

                      <div className="flex-1">
                        <h3 className="font-semibold text-white mb-1">{item.name}</h3>
                        <p className="text-purple-300 font-medium">GHS {Number(item.price).toFixed(2)}</p>
                        {isOutOfStock ? (
                          <p className="text-red-400 text-sm mt-1">Out of Stock</p>
                        ) : isMax ? (
                          <p className="text-yellow-400 text-sm mt-1">Only {maxQty} in stock</p>
                        ) : null}
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          className="glass-button p-2 hover-lift cursor-pointer"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="text-white font-medium min-w-[2rem] text-center">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
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
                          GHS {(Number(item.price) * item.quantity).toFixed(2)}
                        </p>
                      </div>

                      <button
                        onClick={() => removeItem(item.id)}
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
                  <span>Subtotal ({state.itemCount} items)</span>
                  <span>GHS {Number(state.total).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-white/80">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between text-white/80">
                  <span>Tax</span>
                  <span>GHS {(Number(state.total) * 0.08).toFixed(2)}</span>
                </div>
                <div className="border-t border-white/20 pt-4">
                  <div className="flex justify-between text-xl font-semibold text-white">
                    <span>Total</span>
                    <span>GHS {(Number(state.total) * 1.08).toFixed(2)}</span>
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
