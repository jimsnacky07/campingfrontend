import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Barang, CartItem } from '../types';
import apiClient from '../api/client';
import { useAuth } from './AuthContext';

interface CartContextValue {
  items: CartItem[];
  loading: boolean;
  addToCart: (barang: Barang, qty?: number) => Promise<void>;
  remove: (id: number) => Promise<void>;
  updateQty: (id: number, qty: number) => Promise<void>;
  clear: () => Promise<void>;
  totalPrice: number;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export const CartProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchCart = useCallback(async () => {
    if (!user) {
      setItems([]);
      return;
    }
    try {
      setLoading(true);
      const res = await apiClient.get<{ data: any[] }>('/keranjang');
      // Map backend data to CartItem format
      const mapped = res.data.data.map(item => ({
        barang: item.barang,
        qty: item.qty,
      }));
      setItems(mapped);
    } catch (error) {
      console.warn('Failed to fetch cart', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = useCallback(async (barang: Barang, qty = 1) => {
    if (!user) return;
    try {
      const existing = items.find(i => i.barang.id === barang.id);
      const newQty = existing ? existing.qty + qty : qty;

      await apiClient.post('/keranjang', {
        id_barang: barang.id,
        qty: newQty,
      });
      await fetchCart();
    } catch (error) {
      console.warn('Failed to add to cart', error);
    }
  }, [fetchCart, items, user]);

  const remove = useCallback(async (id: number) => {
    if (!user) return;
    try {
      await apiClient.delete(`/keranjang/${id}`);
      await fetchCart();
    } catch (error) {
      console.warn('Failed to remove from cart', error);
    }
  }, [fetchCart, user]);

  const updateQty = useCallback(async (id: number, qty: number) => {
    if (!user) return;
    try {
      await apiClient.put(`/keranjang/${id}`, { qty });
      await fetchCart();
    } catch (error) {
      console.warn('Failed to update qty', error);
    }
  }, [fetchCart, user]);

  const clear = useCallback(async () => {
    if (!user) return;
    try {
      await apiClient.delete('/keranjang');
      setItems([]);
    } catch (error) {
      console.warn('Failed to clear cart', error);
    }
  }, [user]);

  const totalPrice = useMemo(
    () => items.reduce((sum, item) => sum + item.barang.harga_sewa * item.qty, 0),
    [items],
  );

  const value = useMemo(
    () => ({
      items,
      loading,
      addToCart,
      remove,
      updateQty,
      clear,
      totalPrice,
      refreshCart: fetchCart,
    }),
    [addToCart, clear, fetchCart, items, loading, remove, totalPrice, updateQty],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within CartProvider');
  }
  return ctx;
};


