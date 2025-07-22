import React, {
  createContext,
  useReducer,
  useContext,
  useEffect,
  ReactNode,
} from 'react';
import api from '@/services/api';
import { getSessionId } from '@/lib/session';
import { useAuth } from './AuthContext';

// Clean up redundant interfaces and consolidate types
interface CartItem {
  id: number;
  productId: string;
  variantId?: string | null;
  quantity: number;
  price: number;
  name?: string;
  image?: string;
  stock_quantity?: number;
}

interface CartState {
  items: CartItem[];
  itemCount: number;
  total: number;
}

type Action =
  | { type: 'SET_CART'; payload: CartItem[] }
  | { type: 'CLEAR_CART' };

interface CartContextType {
  state: CartState;
  upsertItem: (
    productId: string,
    variantId?: string | null,
    quantity?: number,
    price?: number
  ) => Promise<void>;
  removeItem: (productId: string, variantId?: string) => Promise<void>;
  updateQuantity: (
    productId: string,
    variantId?: string | null,
    quantity: number
  ) => Promise<void>;
  clearCart: () => Promise<void>;
}

const initialState: CartState = {
  items: [],
  itemCount: 0,
  total: 0,
};

const CartContext = createContext<CartContextType | null>(null);

// --- Reducer ---
function cartReducer(state: CartState, action: Action): CartState {
  switch (action.type) {
    case 'SET_CART': {
      const items = Array.isArray(action.payload) ? action.payload : [];

      const itemCount = items.reduce(
        (acc, item) => acc + Math.max(1, Number(item.quantity) || 0),
        0
      );
      const total = items.reduce(
        (acc, item) => acc + (Number(item.price) || 0) * Math.max(1, Number(item.quantity) || 0),
        0
      );

      return { ...state, items, itemCount, total };
    }
    case 'CLEAR_CART':
      return initialState;
    default:
      return state;
  }
}

// --- Provider ---
export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const storageKey = 'ladicare-cart';

  // Load cart data
  useEffect(() => {
    const fetchCart = async () => {
      try {
        if (user) {
          const response = await api.get('/cart', {
            params: { customerId: user.id },
          });
          
          const cartItems = response.data?.items || [];
          dispatch({ type: 'SET_CART', payload: cartItems });
        } else {
          const local: CartItem[] = JSON.parse(localStorage.getItem(storageKey) || '[]');
          dispatch({ type: 'SET_CART', payload: local });
        }
      } catch (err) {
        console.error('❌ Failed to load cart:', err);
        dispatch({ type: 'SET_CART', payload: [] });
      }
    };

    fetchCart();
  }, [user]);

  // Sync localStorage for guest users
  useEffect(() => {
    if (!user) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(state.items));
      } catch (e) {
        console.error('❌ Failed to store cart:', e);
      }
    }
  }, [state.items, user]);

  const upsertItem: CartContextType['upsertItem'] = async (
    productId: string,
    variantId: string | null | undefined,
    quantity: number,
    price: number
  ) => {
    try {
      const qty = Math.max(1, Number(quantity));

      if (user) {
        const response = await api.upsertCartItem({
          productId,
          variantId,
          quantity: qty,
          price: Number(price),
          customerId: user.id,
        });

        if (!response.success) {
          throw new Error(response.message || 'Failed to update cart');
        }

        // Update local state with the server response
        dispatch({ type: 'SET_CART', payload: response.items });
      } else {
        const local: CartItem[] = JSON.parse(localStorage.getItem(storageKey) || '[]');
        const existing = local.find(
          i => i.productId === productId && i.variantId === variantId
        );

        if (existing) {
          existing.quantity += qty;
          existing.price = Number(price);
        } else {
          local.push({
            id: Date.now(),
            productId,
            variantId,
            quantity: qty,
            price: Number(price)
          });
        }

        localStorage.setItem(storageKey, JSON.stringify(local));
        dispatch({ type: 'SET_CART', payload: local });
      }
    } catch (err) {
      console.error('❌ Upsert failed:', err);
      throw err;
    }
  };

  const removeItem: CartContextType['removeItem'] = async (
    productId: string,
    variantId?: string
  ) => {
    if (user) {
      try {
        const response = await api.removeFromCart(productId, user.id, variantId);
        if (response.success) {
          dispatch({ type: 'SET_CART', payload: response.items });
        }
      } catch (err) {
        console.error('❌ Remove failed:', err);
        // Optionally show error message to user
      }
    } else {
      const local: CartItem[] = JSON.parse(localStorage.getItem(storageKey) || '[]');
      const filtered = local.filter(
        i => i.productId !== productId || i.variantId !== variantId
      );
      localStorage.setItem(storageKey, JSON.stringify(filtered));
      dispatch({ type: 'SET_CART', payload: filtered });
    }
  };

  const updateQuantity: CartContextType['updateQuantity'] = async (
    productId: string,
    variantId: string | null | undefined,
    quantity: number
  ) => {
    try {
      const qty = Math.max(0, Number(quantity));

      if (qty === 0) {
        return await removeItem(productId, variantId);
      }

      if (user) {
        const response = await api.updateCartQuantity({
          productId: String(productId),
          variantId: variantId || null,
          quantity: qty,
          customerId: user.id
        });
        
        if (response.success) {
          dispatch({ type: 'SET_CART', payload: response.items });
        } else {
          throw new Error(response.message || 'Failed to update quantity');
        }
      } else {
        const local: CartItem[] = JSON.parse(localStorage.getItem(storageKey) || '[]');
        const updated = local.map(item =>
          item.productId === productId && item.variantId === variantId
            ? { ...item, quantity: qty }
            : item
        );
        localStorage.setItem(storageKey, JSON.stringify(updated));
        dispatch({ type: 'SET_CART', payload: updated });
      }
    } catch (err) {
      console.error('❌ Update quantity failed:', err);
      // Optionally show error message to user
    }
  };

  // Clear cart
  const clearCart: CartContextType['clearCart'] = async () => {
    dispatch({ type: 'CLEAR_CART' });

    if (user) {
      try {
        await api.post('/cart/clear', { customerId: user.id });
      } catch (err) {
        console.error('❌ Clear failed:', err);
      }
    } else {
      localStorage.removeItem(storageKey);
    }
  };

  return (
    <CartContext.Provider
      value={{
        state,
        upsertItem,
        removeItem,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// --- Hook ---
export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};
