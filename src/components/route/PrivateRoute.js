import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// Component bảo vệ các route yêu cầu đăng nhập
const PrivateRoute = ({ roles }) => {
  const { user, isAuthenticated } = useAuth();

  // Nếu chưa đăng nhập, chuyển hướng đến trang đăng nhập
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Nếu có yêu cầu về quyền và người dùng không có quyền đó
  if (roles && (!user.role || (Array.isArray(roles) ? !roles.includes(user.role) : user.role !== roles))) {
    // Chuyển hướng đến trang không có quyền truy cập
    return <Navigate to="/unauthorized" />;
  }

  // Nếu đã đăng nhập và có đủ quyền, render component con
  return <Outlet />;
};

export default PrivateRoute;