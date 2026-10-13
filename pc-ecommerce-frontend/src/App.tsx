import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { WishlistProvider } from './context/WishlistContext';

import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';

import HomePage from './pages/shop/HomePage';
import CatalogPage from './pages/shop/CatalogPage';
import ProductDetailsPage from './pages/shop/ProductDetailsPage';
import CartPage from './pages/shop/CartPage';
import TrackOrderPage from './pages/shop/TrackOrderPage';
import PCBuilderPage from './pages/shop/PCBuilderPage';
import ComparePage from './pages/shop/ComparePage';
import VoucherHubPage from './pages/shop/VoucherHubPage';
import ProfilePage from './pages/shop/ProfilePage';
import WishlistPage from './pages/shop/WishlistPage';
import { BlogDetailsPage } from './pages/shop/BlogDetailsPage';

import DashboardOverview from './pages/admin/DashboardOverview';
import AdminProductManager from './pages/admin/AdminProductManager';
import AdminBannerManager from './pages/admin/AdminBannerManager';
import AdminMediaManager from './pages/admin/AdminMediaManager';
import AdminOrderManager from './pages/admin/AdminOrderManager';
import AdminCouponManager from './pages/admin/AdminCouponManager';
import AdminUserManager from './pages/admin/AdminUserManager';
import AdminBlogManager from './pages/admin/AdminBlogManager';
import AdminChatHub from './pages/admin/AdminChatHub';
import AdminLoginPage from './pages/auth/AdminLoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ProtectedRoute from './components/ProtectedRoute';
import AdminReviewManager from './pages/admin/AdminReviewManager';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <BrowserRouter>
              <Routes>
                {/* Customer Storefront Routes */}
                <Route path="/" element={<MainLayout />}>
                  <Route index element={<HomePage />} />
                  <Route path="products" element={<CatalogPage />} />
                  <Route path="builder" element={<PCBuilderPage />} />
                  <Route path="compare" element={<ComparePage />} />
                  <Route path="vouchers" element={<VoucherHubPage />} />
                  <Route path="wishlist" element={<WishlistPage />} />
                  <Route path="profile" element={<ProfilePage />} />
                  <Route path="product/:slug" element={<ProductDetailsPage />} />
                  <Route path="products/:slug" element={<ProductDetailsPage />} />
                  <Route path="cart" element={<CartPage />} />
                  <Route path="track-order" element={<TrackOrderPage />} />
                  <Route path="register" element={<RegisterPage />} />
                  <Route path="admin/login" element={<AdminLoginPage />} />
                  <Route path="blogs" element={<CatalogPage />} />
                  <Route path="blog/:slug" element={<BlogDetailsPage />} />
                  
                </Route>

                {/* Protected Admin Routes */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute>
                      <AdminLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Navigate to="/admin/dashboard" replace />} />
                  <Route path="dashboard" element={<DashboardOverview />} />
                  <Route path="products" element={<AdminProductManager />} />
                  <Route path="reviews" element={<AdminReviewManager />} />
                  <Route path="chat" element={<AdminChatHub />} />
                  <Route path="banners" element={<AdminBannerManager />} />
                  <Route path="media" element={<AdminMediaManager />} />
                  <Route path="orders" element={<AdminOrderManager />} />
                  <Route path="coupons" element={<AdminCouponManager />} />
                  <Route path="users" element={<AdminUserManager />} />
                  <Route path="blogs" element={<AdminBlogManager />} />
                </Route>

                {/* 404 Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </BrowserRouter>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;