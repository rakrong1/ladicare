// src/pages/Index.tsx
import React from 'react';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import Home from './Home';
import Products from './Products';
import ProductDetails from './ProductDetails';
import Cart from './Cart';
import Checkout from './Checkout';
import About from './About';
import Contact from './Contact';
import Admin from './Admin';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import { CartProvider } from './CartContext';
import { ProductProvider } from './ProductContext';
import '../styles/global.css';
import '../styles/glassmorphism.css';
import '../styles/animations.css';
import '../styles/3d-effects.css';

const Index = () => {
  return (
    <AuthProvider>
      <ProductProvider>
        <CartProvider>
          <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
            <Header />
            <main className="min-h-screen">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<Products />} />
                <Route path="/products/:id" element={<ProductDetails />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/admin" element={<Admin />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </CartProvider>
      </ProductProvider>
    </AuthProvider>
  );
};

export default Index;
