import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Product } from '../types';

interface WishlistContextType {
  wishlist: Product[];
  wishlistCount: number;
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlist, setWishlist] = useState<Product[]>(() => {
    const saved = localStorage.getItem('gearstore_wishlist');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (err) {
        console.error('Failed to parse wishlist from storage:', err);
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('gearstore_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const addToWishlist = (product: Product) => {
    setWishlist((prev) => {
      const exists = prev.some((item) => item._id === product._id);
      if (!exists) {
        return [product, ...prev];
      }
      return prev;
    });
  };

  const removeFromWishlist = (productId: string) => {
    setWishlist((prev) => prev.filter((item) => item._id !== productId));
  };

  const isInWishlist = (productId: string) => {
    return wishlist.some((item) => item._id === productId);
  };

  const clearWishlist = () => {
    setWishlist([]);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistCount: wishlist.length,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = (): WishlistContextType => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};