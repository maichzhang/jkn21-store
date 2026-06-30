import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from './AuthContext';

const CartCtx = createContext(null);
export const useCart = () => useContext(CartCtx);

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchCart = async () => {
    if (!user) { setCart([]); return; }
    try {
      const res = await api.get('/cart');
      setCart(res.data);
    } catch {}
  };

  useEffect(() => { fetchCart(); }, [user]);

  const addToCart = async (product_id, qty = 1) => {
    await api.post('/cart', { product_id, qty });
    await fetchCart();
  };

  const updateQty = async (id, qty) => {
    await api.put(`/cart/${id}`, { qty });
    await fetchCart();
  };

  const removeItem = async (id) => {
    await api.delete(`/cart/${id}`);
    await fetchCart();
  };

  const clearCart = async () => {
    await api.delete('/cart');
    setCart([]);
  };

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const count = cart.reduce((s, i) => s + i.qty, 0);

  return (
    <CartCtx.Provider value={{ cart, addToCart, updateQty, removeItem, clearCart, total, count, fetchCart }}>
      {children}
    </CartCtx.Provider>
  );
}
