import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';
import api from '@/services/api';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from './AuthContext';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  stock_quantity?: number;
}

interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: Omit<CartItem, 'quantity'> }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: CartItem[] };

const CartContext = createContext<{
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
} | null>(null);

// 🔁 Reducer logic
const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItem = state.items.find(item => item.id === action.payload.id);
      const maxStock = action.payload.stock_quantity ?? 99;

      if (existingItem) {
        const newQuantity = Math.min(existingItem.quantity + 1, maxStock);
        const updatedItems = state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: newQuantity, stock_quantity: maxStock }
            : item
        );
        return {
          ...state,
          items: updatedItems,
          total: updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
          itemCount: updatedItems.reduce((count, item) => count + item.quantity, 0),
        };
      } else {
        const newItem: CartItem = {
          ...action.payload,
          quantity: 1,
          stock_quantity: action.payload.stock_quantity ?? 99,
        };
        const newItems = [...state.items, newItem];
        return {
          ...state,
          items: newItems,
          total: newItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
          itemCount: newItems.reduce((count, item) => count + item.quantity, 0),
        };
      }
    }

    case 'UPDATE_QUANTITY': {
      const updatedItems = state.items.map(item => {
        if (item.id === action.payload.id) {
          const maxStock = item.stock_quantity ?? 99;
          const qty = Math.max(1, Math.min(action.payload.quantity, maxStock));
          return { ...item, quantity: qty };
        }
        return item;
      });
      return {
        ...state,
        items: updatedItems,
        total: updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
        itemCount: updatedItems.reduce((count, item) => count + item.quantity, 0),
      };
    }

    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(item => item.id !== action.payload);
      return {
        ...state,
        items: newItems,
        total: newItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
        itemCount: newItems.reduce((count, item) => count + item.quantity, 0),
      };
    }

    case 'CLEAR_CART':
      return {
        items: [],
        total: 0,
        itemCount: 0,
      };

    case 'LOAD_CART': {
      const cleaned = action.payload.map(item => ({
        ...item,
        quantity: Math.min(item.quantity, item.stock_quantity ?? 99),
      }));
      return {
        items: cleaned,
        total: cleaned.reduce((sum, item) => sum + item.price * item.quantity, 0),
        itemCount: cleaned.reduce((count, item) => count + item.quantity, 0),
      };
    }

    default:
      return state;
  }
};

// 🛒 Provider
export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    total: 0,
    itemCount: 0,
  });

  const { user } = useAuth();
  const lastSyncedRef = useRef<string | null>(null);

  // 💾 Load cart from storage on mount
  useEffect(() => {
    const storedCart = localStorage.getItem('ladicare-cart');
    if (storedCart) {
      try {
        const parsed = JSON.parse(storedCart);
        dispatch({ type: 'LOAD_CART', payload: parsed });
      } catch (err) {
        console.error('❌ Failed to load cart from localStorage:', err);
      }
    }

    // Ensure session ID exists
    if (!localStorage.getItem('ladicare-session')) {
      localStorage.setItem('ladicare-session', uuidv4());
    }
  }, []);

  // 🔁 Sync cart to backend (debounced)
  const syncCartToBackend = useCallback(async () => {
    try {
      const sessionId = localStorage.getItem('ladicare-session');
      if (!sessionId) return;

      const serialized = JSON.stringify(state.items);
      if (serialized === lastSyncedRef.current) return;

      lastSyncedRef.current = serialized;

      await api.post('/cart/sync', {
        sessionId,
        items: state.items.map(item => ({
          id: item.id,
          variant_id: null,
          quantity: item.quantity,
        })),
      });
    } catch (err) {
      console.error('🛒 Failed to sync cart with backend:', err);
    }
  }, [state.items]);

  // ⏱ Debounce localStorage and backend sync
  useEffect(() => {
    const timeout = setTimeout(() => {
      localStorage.setItem('ladicare-cart', JSON.stringify(state.items));
      syncCartToBackend();
    }, 400);

    return () => clearTimeout(timeout);
  }, [state.items, syncCartToBackend]);

  // Expose functions
  const addItem = (item: Omit<CartItem, 'quantity'>) => {
    dispatch({ type: 'ADD_ITEM', payload: item });
  };

  const removeItem = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });
  };

  const updateQuantity = (id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  return (
    <CartContext.Provider value={{ state, dispatch, addItem, removeItem, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

// 🧠 Custom hook
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
