import { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../api/client';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cartItems');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  const syncWithDb = async () => {
    try {
      const { data } = await api.post('/cart', { cartItems });
      const mergedItems = data.cartItems.map((item) => ({
        product: item.product,
        name: item.name,
        image: item.image,
        price: item.price,
        countInStock: item.countInStock,
        qty: item.qty,
      }));
      setCartItems(mergedItems);
      setSynced(true);
      localStorage.setItem('cartItems', JSON.stringify(mergedItems));
    } catch (error) {
      console.error('Error syncing cart:', error);
    }
  };

  const fetchDbCart = async () => {
    try {
      const { data } = await api.get('/cart');
      const items = data.cartItems.map((item) => ({
        product: item.product,
        name: item.name,
        image: item.image,
        price: item.price,
        countInStock: item.countInStock,
        qty: item.qty,
      }));
      setCartItems(items);
      localStorage.setItem('cartItems', JSON.stringify(items));
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  };

  const addToCart = (product, qty) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product === product._id);
      if (existing) {
        toast.success(`Updated ${product.name} quantity in cart`);
        return prev.map((item) =>
          item.product === product._id
            ? { ...item, qty: item.qty + qty }
            : item
        );
      }
      toast.success(`${product.name} added to cart`);
      return [
        ...prev,
        {
          product: product._id,
          name: product.name,
          image: product.image,
          price: product.price,
          countInStock: product.countInStock,
          qty,
        },
      ];
    });
    if (synced) {
      api.post('/cart/add', { productId: product._id, qty }).catch(console.error);
    }
  };

  const removeFromCart = (productId) => {
    setCartItems((prev) => {
      const item = prev.find((i) => i.product === productId);
      if (item) {
        toast.info(`${item.name} removed from cart`);
      }
      return prev.filter((item) => item.product !== productId);
    });
    if (synced) {
      api.delete(`/cart/item/${productId}`).catch(console.error);
    }
  };

  const updateQty = (productId, qty) => {
    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.product === productId ? { ...item, qty } : item
      )
    );
    if (synced) {
      api.put('/cart/item', { productId, qty }).catch(console.error);
    }
  };

  const clearCart = () => {
    setCartItems([]);
    if (synced) {
      api.delete('/cart/clear').catch(console.error);
    }
  };

  const cartTotal = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  const cartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQty,
        clearCart,
        cartTotal,
        cartCount,
        syncWithDb,
        fetchDbCart,
        synced,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
