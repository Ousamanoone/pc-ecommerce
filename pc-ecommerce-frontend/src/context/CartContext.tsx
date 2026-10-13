import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import type { Product } from '../types';

export interface CartItem extends Product {
  qty: number;
}

interface CartContextType {
  cart: CartItem[];
  cartItems: CartItem[]; // Hỗ trợ cả 2 tên gọi
  items: CartItem[];
  cartCount: number;
  cartTotal: number;
  total: number;
  addToCart: (product: Product, qty?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, qty: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  // Tạo khóa lưu trữ riêng biệt theo ID tài khoản (hoặc khách vãng lai)
  const getStorageKey = (userId?: string) => {
    return userId ? `gearstore_cart_${userId}` : 'gearstore_cart_guest';
  };

  const [cart, setCart] = useState<CartItem[]>(() => {
    const key = getStorageKey(user?._id);
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : [];
  });

  // Tự động chuyển đổi dữ liệu giỏ hàng khi người dùng đăng nhập, đổi tài khoản hoặc đăng xuất
  useEffect(() => {
    const key = getStorageKey(user?._id);
    const saved = localStorage.getItem(key);
    setCart(saved ? JSON.parse(saved) : []);
  }, [user?._id]);

  // Đồng bộ giỏ hàng vào localStorage của đúng tài khoản đang hoạt động
  useEffect(() => {
    const key = getStorageKey(user?._id);
    localStorage.setItem(key, JSON.stringify(cart));
  }, [cart, user?._id]);

  const addToCart = (product: Product, qty = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item._id === product._id);
      if (existing) {
        return prev.map((item) =>
          item._id === product._id ? { ...item, qty: item.qty + qty } : item
        );
      }
      return [...prev, { ...product, qty }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item._id !== productId));
  };

  const updateQuantity = (productId: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item._id === productId ? { ...item, qty } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
    const key = getStorageKey(user?._id);
    localStorage.removeItem(key);
  };

  // Tính tổng số lượng và tổng tiền
  const cartCount = cart.reduce((acc, item) => acc + (item.qty || 1), 0);
  const cartTotal = cart.reduce((acc, item) => {
    const price = item.discountPrice || item.price || 0;
    return acc + price * (item.qty || 1);
  }, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        cartItems: cart, // Cung cấp cartItems để CartPage đọc chính xác
        items: cart,
        cartCount,
        cartTotal,
        total: cartTotal,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};