import React, { createContext, useState, useEffect, useContext } from 'react';
import {
  getCurrentUser,
  logout as authLogout,
  setupAxiosInterceptors,
  getUserProfile,
  isTokenValid
} from '../services/authService';

// Tạo Context
const AuthContext = createContext();

// Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Setup Axios interceptors
    setupAxiosInterceptors();

    // Khôi phục user từ localStorage và kiểm tra token
    const initAuth = async () => {
      try {
        // Kiểm tra token còn hạn hay không
        if (isTokenValid()) {
          // Lấy user từ localStorage trước
          const localUser = getCurrentUser();
          if (localUser) {
            setUser(localUser);

            // Cập nhật thông tin mới nhất từ API
            try {
              const currentUser = await getUserProfile();
              setUser(prev => ({ ...prev, ...currentUser }));
            } catch (profileError) {
              console.error('Error fetching user profile:', profileError);
              // Không set lỗi ở đây để tránh làm gián đoạn trải nghiệm người dùng
              // Vẫn giữ thông tin user cũ từ localStorage
            }
          }
        } else {
          // Token không hợp lệ hoặc hết hạn, đăng xuất
          handleLogout();
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setError('Lỗi xác thực, vui lòng đăng nhập lại');
        handleLogout();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Đăng nhập - được gọi sau khi API login/register thành công
  const login = (userData) => {
    setUser(userData);
    setError(null);
  };

  // Đăng xuất
  const handleLogout = () => {
    authLogout();
    setUser(null);
    setError(null);
  };

  // Kiểm tra user có quyền không
  const hasRole = (roles) => {
    if (!user) return false;
    if (typeof roles === 'string') return user.role === roles;
    return roles.includes(user.role);
  };

  // Cập nhật thông tin user
  const updateUser = (userData) => {
    setUser(prev => ({ ...prev, ...userData }));
  };

  const authContextValue = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    logout: handleLogout,
    hasRole,
    updateUser
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {!loading ? children : (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      )}
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