import { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../api/client';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const { user } = useAuth();

  const fetchWishlist = async () => {
    if (!user) return;
    
    try {
      const { data } = await api.get('/wishlist');
      setWishlistItems(data.items || []);
    } catch {
      console.error('Error fetching wishlist:');
    }
  };

  useEffect(() => {
    if (user) {
      fetchWishlist();
    } else {
      setWishlistItems([]);
    }
  }, [user]);

  const addToWishlist = async (productId) => {
    try {
      const { data } = await api.post('/wishlist', { productId });
      setWishlistItems(data.items || []);
      toast.success('Added to wishlist');
      return true;
    } catch (error) {
      if (error.response?.status === 400) {
        toast.info('Already in wishlist');
      } else {
        toast.error('Failed to add to wishlist');
      }
      return false;
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      const { data } = await api.delete(`/wishlist/${productId}`);
      setWishlistItems(data.items || []);
      toast.info('Removed from wishlist');
      return true;
    } catch {
      toast.error('Failed to remove from wishlist');
      return false;
    }
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some(
      (item) => item.product && item.product._id === productId
    );
  };

  const moveToCart = async (productId, qty = 1) => {
    try {
      const { data } = await api.post('/wishlist/move-to-cart', { productId, qty });
      await fetchWishlist();
      toast.success('Moved to cart');
      return data.product;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to move to cart');
      return null;
    }
  };

  const clearWishlist = () => {
    setWishlistItems([]);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        moveToCart,
        clearWishlist,
        fetchWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};
