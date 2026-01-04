import React, { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext();
const LS_KEY = 'cart_items';

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem(LS_KEY);
    if (stored) {
      setItems(JSON.parse(stored));
    }
  }, []);

  const persist = updated => {
    setItems(updated);
    localStorage.setItem(LS_KEY, JSON.stringify(updated));
  };

  const addToCart = product => {
    const existing = items.find(i => i.id === product.id);
    if (existing) {
      const updated = items.map(i => (i.id === product.id ? { ...i, qty: i.qty + 1 } : i));
      persist(updated);
    } else {
      persist([...items, { ...product, qty: 1 }]);
    }
  };

  const removeFromCart = id => {
    persist(items.filter(i => i.id !== id));
  };

  const updateQty = (id, qty) => {
    if (qty <= 0) return removeFromCart(id);
    const updated = items.map(i => (i.id === id ? { ...i, qty } : i));
    persist(updated);
  };

  const clearCart = () => persist([]);

  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);

  const value = {
    items,
    addToCart,
    removeFromCart,
    updateQty,
    clearCart,
    subtotal,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => useContext(CartContext);
