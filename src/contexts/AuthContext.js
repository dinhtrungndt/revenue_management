import React, { createContext, useState, useEffect, useContext } from 'react';
import { getCurrentUser, logout, setupAxiosInterceptors } from '../services/authService';

// Tạo Context
const AuthContext = createContext();

// Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Setup Axios interceptors
    setupAxiosInterceptors();

    // Khôi phục user từ localStorage
    const initAuth = async () => {
      try {
        const user = getCurrentUser();
        if (user) {
          setUser(user);
        }
      } catch (error) {
        console.error('Lỗi khôi phục thông tin người dùng:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Đăng nhập
  const login = (userData) => {
    setUser(userData);
  };

  // Đăng xuất
  const handleLogout = () => {
    logout();
    setUser(null);
  };

  // Kiểm tra user có quyền không
  const hasRole = (roles) => {
    if (!user) return false;
    if (typeof roles === 'string') return user.role === roles;
    return roles.includes(user.role);
  };

  const authContextValue = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout: handleLogout,
    hasRole
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Custom Hook để sử dụng AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth phải được sử dụng trong AuthProvider');
  }
  return context;
};

export default AuthContext;