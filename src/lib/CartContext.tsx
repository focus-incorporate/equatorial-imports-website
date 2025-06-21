'use client';

import { createContext, useContext, useReducer, useEffect, useState, ReactNode } from 'react';
import { CartItem, Product } from '@/types';
import { useToast } from './ToastContext';

interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
}

type CartAction =
  | { type: 'ADD_ITEM'; product: Product; quantity?: number }
  | { type: 'REMOVE_ITEM'; productId: string }
  | { type: 'UPDATE_QUANTITY'; productId: string; quantity: number }
  | { type: 'CLEAR_CART' }
  | { type: 'HYDRATE_CART'; state: CartState };

interface CartContextType {
  state: CartState;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItemIndex = state.items.findIndex(
        item => item.product.id === action.product.id
      );

      let newItems: CartItem[];
      if (existingItemIndex > -1) {
        newItems = state.items.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + (action.quantity || 1) }
            : item
        );
      } else {
        newItems = [
          ...state.items,
          { product: action.product, quantity: action.quantity || 1 }
        ];
      }

      const total = newItems.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
      );
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);

      return { items: newItems, total, itemCount };
    }

    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(item => item.product.id !== action.productId);
      const total = newItems.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
      );
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);

      return { items: newItems, total, itemCount };
    }

    case 'UPDATE_QUANTITY': {
      if (action.quantity <= 0) {
        return cartReducer(state, { type: 'REMOVE_ITEM', productId: action.productId });
      }

      const newItems = state.items.map(item =>
        item.product.id === action.productId
          ? { ...item, quantity: action.quantity }
          : item
      );

      const total = newItems.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
      );
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);

      return { items: newItems, total, itemCount };
    }

    case 'CLEAR_CART':
      return { items: [], total: 0, itemCount: 0 };

    case 'HYDRATE_CART':
      return action.state;

    default:
      return state;
  }
}

const CART_STORAGE_KEY = 'equatorial-imports-cart';

// Always start with empty cart for SSR consistency
const initialState: CartState = {
  items: [],
  total: 0,
  itemCount: 0,
};

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const [isHydrated, setIsHydrated] = useState(false);
  
  // Use toast hook properly
  const { showToast } = useToast();

  // Hydrate cart from localStorage on client side
  useEffect(() => {
    if (typeof window !== 'undefined' && !isHydrated) {
      try {
        const stored = localStorage.getItem(CART_STORAGE_KEY);
        if (stored) {
          const parsedState = JSON.parse(stored);
          // Recalculate totals to ensure consistency
          const total = parsedState.items.reduce(
            (sum: number, item: CartItem) => sum + item.product.price * item.quantity,
            0
          );
          const itemCount = parsedState.items.reduce(
            (sum: number, item: CartItem) => sum + item.quantity, 
            0
          );
          const hydratedState = { ...parsedState, total, itemCount };
          
          // Only dispatch if there are items to restore
          if (hydratedState.items.length > 0) {
            dispatch({ type: 'HYDRATE_CART', state: hydratedState });
          }
        }
      } catch (error) {
        console.error('Failed to hydrate cart from localStorage:', error);
      }
      setIsHydrated(true);
    }
  }, [isHydrated]);

  // Save cart to localStorage whenever state changes (but not during initial hydration)
  useEffect(() => {
    if (isHydrated && typeof window !== 'undefined') {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state));
      } catch (error) {
        console.error('Failed to save cart to localStorage:', error);
      }
    }
  }, [state, isHydrated]);

  const addItem = (product: Product, quantity = 1) => {
    if (!product.inStock) {
      showToast(`${product.name} is currently out of stock`, 'error');
      return;
    }
    
    dispatch({ type: 'ADD_ITEM', product, quantity });
    showToast(
      `${quantity} × ${product.name} added to cart`, 
      'success'
    );
  };

  const removeItem = (productId: string) => {
    dispatch({ type: 'REMOVE_ITEM', productId });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', productId, quantity });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  return (
    <CartContext.Provider value={{ state, addItem, removeItem, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}