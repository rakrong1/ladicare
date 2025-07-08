import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Search,
  ShoppingCart,
  Menu,
  X,
  User,
  Shield,
  LogOut,
} from 'lucide-react';
import { useCart } from '../../pages/CartContext';
import { useAuth } from '../../pages/AuthContext';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { state: cartState } = useCart();
  const { user, isAuthenticated, openModal, logout } = useAuth();

  const location = useLocation();
  const navigate = useNavigate();

  const navigationItems = [
    { name: 'Home', path: '/' },
    { name: 'Products', path: '/products' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  const isActivePath = (path: string) => location.pathname === path;

  const handleAdminAccess = () => {
    if (!isAuthenticated) return openModal();
    if (user?.role === 'admin' || user?.role === 'superAdmin') {
      navigate('/admin');
    } else {
      navigate('/');
    }
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen((prev) => !prev);
  };

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    navigate('/');
  };

  return (
    <header className="glass-nav fixed top-0 left-0 right-0 z-50 px-4 py-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="font-display text-2xl font-bold text-white hover-glow"
          >
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Ladicare
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`nav-item-3d px-4 py-2 rounded-lg transition-all duration-300 ${
                  isActivePath(item.path)
                    ? 'text-purple-300 bg-white/10'
                    : 'text-white hover:text-purple-300'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Search bar for large screens */}
          <div className="hidden lg:flex items-center">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="glass-input w-64 pl-10 pr-4"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-4 h-4" />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-4 relative">
            <button className="lg:hidden glass-button p-2">
              <Search className="w-5 h-5" />
            </button>

            <Link to="/cart" className="glass-button p-2 relative hover-lift">
              <ShoppingCart className="w-5 h-5" />
              {cartState.itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-pulse">
                  {cartState.itemCount}
                </span>
              )}
            </Link>

            {/* Admin Access */}
            <button
              onClick={handleAdminAccess}
              className="glass-button p-2 hover-lift"
              title="Admin Panel"
            >
              <Shield className="w-5 h-5" />
            </button>

            {/* User menu or login button */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={toggleUserMenu}
                  className="glass-button p-2 hover-lift"
                  title="User Menu"
                >
                  <User className="w-5 h-5" />
                </button>
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-40 glass-card p-3 animate-fade-in-scale shadow-lg z-50">
                    <p className="text-white mb-2">{user.name}</p>
                    <button
                      onClick={handleLogout}
                      className="glass-button w-full flex items-center gap-2 text-red-300 hover:text-red-400"
                    >
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={openModal}
                className="glass-button p-2 hover-lift"
              >
                <User className="w-5 h-5" />
              </button>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden glass-button p-2"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 glass-card p-4 animate-fade-in-scale">
            <div className="flex flex-col space-y-3">
              <div className="relative mb-4">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="glass-input w-full pl-10 pr-4"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-4 h-4" />
              </div>

              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`px-4 py-3 rounded-lg transition-all duration-300 ${
                    isActivePath(item.path)
                      ? 'text-purple-300 bg-white/10'
                      : 'text-white hover:text-purple-300 hover:bg-white/5'
                  }`}
                >
                  {item.name}
                </Link>
              ))}

              {!isAuthenticated ? (
                <button
                  onClick={() => {
                    openModal();
                    setIsMenuOpen(false);
                  }}
                  className="glass-button w-full mt-2"
                >
                  Login / Signup
                </button>
              ) : (
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="glass-button w-full mt-2 text-red-300"
                >
                  Logout
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
