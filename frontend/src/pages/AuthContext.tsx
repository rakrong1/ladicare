import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import api from '@/services/api';
import AuthModal from '@/components/auth/AuthModal';

export type Role = 'superAdmin' | 'admin' | 'customer';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  iat?: number;
  exp?: number;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (token: string) => void;
  logout: () => void;
  openModal: () => void;
  closeModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const isTokenExpired = (token: string): boolean => {
    try {
      const decoded: User = jwtDecode(token);
      return decoded.exp ? Date.now() >= decoded.exp * 1000 : true;
    } catch {
      return true;
    }
  };

  const initializeAuth = () => {
    const token = localStorage.getItem('token');
    if (!token || isTokenExpired(token)) {
      logout();
      setLoading(false);
      return;
    }

    try {
      const decoded: User = jwtDecode(token);
      setUser(decoded);
      setIsAuthenticated(true);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } catch (err) {
      console.error('❌ Failed to decode token:', err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initializeAuth();
  }, []);

  const login = (token: string) => {
    if (!token || isTokenExpired(token)) {
      console.error('❌ Invalid or expired token on login');
      return;
    }

    try {
      const decoded: User = jwtDecode(token);
      setUser(decoded);
      setIsAuthenticated(true);
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setShowModal(false);

      // ✅ Role-based navigation
      if (decoded.role === 'customer') {
        navigate('/');
      } else {
        navigate('/admin');
      }
    } catch (err) {
      console.error('❌ Login failed:', err);
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token && !isTokenExpired(token)) {
        try {
          await api.post('/auth/logout');
        } catch (err) {
          console.warn('⚠️ Logout request failed but proceeding:', err);
        }
      }
    } finally {
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        login,
        logout,
        openModal,
        closeModal,
      }}
    >
      {children}
      {showModal && <AuthModal onClose={closeModal} />}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
