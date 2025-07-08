import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/services/api';
import { useAuth } from '@/pages/AuthContext';

interface AuthModalProps {
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = (): string | null => {
    if (!form.email.trim() || !form.password.trim()) {
      return 'Email and password are required.';
    }
    if (!isLogin && !form.name.trim()) {
      return 'Name is required for registration.';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const validationMessage = validateForm();
    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    const payload = isLogin
      ? { email: form.email.trim(), password: form.password }
      : { name: form.name.trim(), email: form.email.trim(), password: form.password };

    try {
      setLoading(true);
      const response = isLogin
        ? await api.login(payload)
        : await api.register(payload);

      const { token } = response;

      if (!token) throw new Error('Invalid response format');

      login(token);      // ✅ update AuthContext
      onClose();         // ✅ close modal
      navigate('/admin'); // ✅ redirect

    } catch (err: any) {
      let message = 'Something went wrong. Please try again.';

      if (err.response) {
        message = err.response.data?.error || err.response.data?.message || `Server error: ${err.response.status}`;
      } else if (err.request) {
        message = 'No response from server. Please check your connection.';
      } else {
        message = err.message || 'Request failed to process.';
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center px-4">
      <div className="bg-white text-black rounded-lg shadow-xl w-full max-w-md p-6 relative animate-fade-in-scale">
        <button
          aria-label="Close auth modal"
          onClick={onClose}
          className="absolute top-2 right-3 text-2xl text-gray-500 hover:text-black"
        >
          &times;
        </button>

        <h2 className="text-2xl font-bold mb-6 text-center">
          {isLogin ? 'Login to Your Account' : 'Create an Account'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              value={form.name}
              onChange={handleChange}
              className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          )}
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 text-white py-3 rounded font-semibold hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? 'Processing...' : isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>

        <p className="text-sm text-center mt-5">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button
            onClick={() => setIsLogin(prev => !prev)}
            className="text-purple-600 hover:underline"
          >
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthModal;
