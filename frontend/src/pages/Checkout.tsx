import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from './CartContext';
import { PaystackButton } from 'react-paystack';

const Checkout = () => {
  const { state, clearCart } = useCart();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Ghana',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (state.items.length === 0) {
    navigate('/cart');
    return null;
  }

  const subtotal = state.total;
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  const paystackPublicKey = 'pk_test_your_key_here';
  const reference = `LAD-${Date.now()}`;

  const handlePaystackSuccess = (ref) => {
    clearCart();
    alert('Payment successful! Reference: ' + ref.reference);
    navigate('/');
  };

  const handlePaystackClose = () => {
    alert('Transaction cancelled.');
  };

  const paystackProps = {
    email: formData.email,
    amount: total * 100,
    metadata: {
      name: `${formData.firstName} ${formData.lastName}`,
      phone: formData.phone,
      address: formData.address,
    },
    publicKey: paystackPublicKey,
    text: `Pay ₵${total.toFixed(2)}`,
    onSuccess: handlePaystackSuccess,
    onClose: handlePaystackClose,
  };

  return (
    <div className="pt-24 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4 animate-fade-in">Checkout</h1>
          <p className="text-xl text-white/80 animate-fade-in">Complete your order</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Checkout Form */}
          <div className="glass-card p-8 animate-slide-in-left">
            <form className="space-y-8">
              {/* Customer Info + Address */}
              <div>
                <h2 className="text-2xl font-semibold text-white mb-6">Customer Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input name="firstName" placeholder="First Name" required value={formData.firstName} onChange={handleChange} className="glass-input" />
                  <input name="lastName" placeholder="Last Name" required value={formData.lastName} onChange={handleChange} className="glass-input" />
                  <input name="email" placeholder="Email" required type="email" value={formData.email} onChange={handleChange} className="glass-input" />
                  <input name="phone" placeholder="Phone" value={formData.phone} onChange={handleChange} className="glass-input" />
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-semibold text-white mb-6">Shipping Address</h2>
                <input name="address" placeholder="Address" required value={formData.address} onChange={handleChange} className="glass-input w-full" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <input name="city" placeholder="City" required value={formData.city} onChange={handleChange} className="glass-input" />
                  <input name="state" placeholder="State" required value={formData.state} onChange={handleChange} className="glass-input" />
                  <input name="zipCode" placeholder="ZIP Code" required value={formData.zipCode} onChange={handleChange} className="glass-input" />
                </div>
              </div>

              <div className="text-center mt-6">
                <PaystackButton className="glass-button-primary w-full py-4 font-semibold hover-lift" {...paystackProps} />
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div className="animate-slide-in-right">
            <div className="glass-card p-8 sticky top-24">
              <h2 className="text-2xl font-semibold text-white mb-6">Order Summary</h2>
              <div className="space-y-4 mb-6">
                {state.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-white">{item.name}</h4>
                      <p className="text-white/60 text-sm">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-white font-medium">
                      ₵{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-3 border-t border-white/20 pt-6">
                <div className="flex justify-between text-white/80">
                  <span>Subtotal</span>
                  <span>₵{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-white/80">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between text-white/80">
                  <span>Tax</span>
                  <span>₵{tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xl font-semibold text-white border-t border-white/20 pt-3">
                  <span>Total</span>
                  <span>₵{total.toFixed(2)}</span>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-white/20 text-center">
                <p className="text-white/70 text-sm">🔒 Your payment is secure via Paystack</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
