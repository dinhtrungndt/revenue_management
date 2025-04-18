import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// Component bảo vệ các route yêu cầu đăng nhập
const PrivateRoute = ({ roles }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Nếu đang loading, hiển thị trạng thái loading
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Nếu chưa đăng nhập, chuyển hướng đến trang đăng nhập với return url
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Nếu có yêu cầu về quyền và người dùng không có quyền đó
  if (roles && (!user.role || (Array.isArray(roles) ? !roles.includes(user.role) : user.role !== roles))) {
    // Chuyển hướng đến trang không có quyền truy cập
    return <Navigate to="/unauthorized" replace />;
  }

  // Nếu đã đăng nhập và có đủ quyền, render component con
  return <Outlet />;
};

export default PrivateRoute;