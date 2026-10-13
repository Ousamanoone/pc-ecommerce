import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface User {
  _id?: string;
  name?: string;
  email?: string;
  role?: string;
  [key: string]: any;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAdmin: boolean;
  isAuthenticated: boolean;
  login: (arg1: any, arg2?: any) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [user, setUser] = useState<User | null>(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    window.location.href = '/admin/login';
  };

  const login = (arg1: any, arg2?: any) => {
    let finalToken = '';
    let finalUser: User | null = null;

    // Nhận diện linh hoạt không sợ ngược tham số:
    if (typeof arg1 === 'string') {
      finalToken = arg1;
      finalUser = typeof arg2 === 'object' ? (arg2?.user || arg2) : null;
    } else if (typeof arg2 === 'string') {
      finalToken = arg2;
      finalUser = typeof arg1 === 'object' ? (arg1?.user || arg1) : null;
    } else if (arg1 && typeof arg1 === 'object') {
      finalToken = arg1.token || arg1.user?.token || '';
      finalUser = arg1.user || arg1;
    }

    if (finalToken) {
      localStorage.setItem('token', finalToken);
      setToken(finalToken);
    }
    if (finalUser && Object.keys(finalUser).length > 0) {
      localStorage.setItem('user', JSON.stringify(finalUser));
      setUser(finalUser);
    }
  };

  const isAdmin = user?.role === 'admin' || user?.role === 'staff';
  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAdmin,
        isAuthenticated,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;