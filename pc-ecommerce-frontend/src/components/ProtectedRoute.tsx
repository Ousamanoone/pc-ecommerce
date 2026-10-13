import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, token, isAdmin } = useAuth();

  // Đọc dự phòng từ localStorage nếu state React chưa kịp nạp
  const currentToken = token || localStorage.getItem('token');
  const currentUser = user || (() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  })();

  if (!currentToken || !currentUser) {
    return <Navigate to="/admin/login" replace />;
  }

  const hasAccess =
    isAdmin ||
    currentUser.role === 'admin' ||
    currentUser.role === 'staff';

  if (!hasAccess) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;