import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastContainer, toast } from 'react-toastify';

// Pages
import Login from './pages/user/Login/index.js';
import Register from './pages/user/Register/index.js';
import  HomePage  from './pages/home';
import Unauthorized from './pages/user/Unauthorized/index.js';
import ProductDetailPage from './pages/products/detail/index.js';
import ProductsPage from './pages/products/index.js';
import OrderHistoryPage from './pages/history/index.js';
import AccountPage from  './pages/account/index.js';
import ContactPage from './pages/admin/contact/index.js';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import InventoryReport from './pages/admin/InventoryReport';
import ExportReport from './pages/admin/ExportReport';
import RevenueReport from './pages/admin/RevenueReport';
import AdminProductsPage from './pages/admin/products/list/index.js';
import AddProducts from './pages/admin/products/add/index.js';
import EditProductPage from './pages/admin/products/update/index.js';
import ProductDetailDialogAdmin from './pages/admin/products/detail/index.js';

// Components & Layouts
import PrivateRoute from './components/route/PrivateRoute.js';
import AdminLayout from './components/layouts/AdminLayout';
import StaffLayout from './components/layouts/StaffLayout';
import MainLayout from './components/layouts/MainLayout.js';
import { useAuth } from './contexts/AuthContext.js';
import CostsMana from './pages/admin/costsMana/index.js';
import ExpenseReport from './pages/admin/ExpenseReport/index.js';

const RoleBasedRedirect = () => {
  const { user } = useAuth();

  if (user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  } else if (user?.role === 'staff') {
    return <Navigate to="/staff" replace />;
  } else {
    return <Navigate to="/" replace />;
  }
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Role-based redirect */}
          <Route path="/dashboard" element={<PrivateRoute />}>
            <Route index element={<RoleBasedRedirect />} />
          </Route>

          {/* Customer Routes with MainLayout */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<PrivateRoute />}>
              <Route index element={<HomePage />} />
            </Route>

            <Route path="/products" element={<PrivateRoute />}>
              <Route index element={<ProductsPage />} />
            </Route>

            <Route path="/product/:id" element={<PrivateRoute />}>
              <Route index element={<ProductDetailPage />} />
            </Route>

            <Route path="/order-history" element={<PrivateRoute />}>
              <Route index element={<OrderHistoryPage />} />
            </Route>

            <Route path="/account" element={<PrivateRoute />}>
              <Route index element={<AccountPage />} />
            </Route>

            <Route path="/contact" element={<PrivateRoute />}>
              <Route index element={<ContactPage />} />
            </Route>
          </Route>

          {/* Admin Routes with AdminLayout */}
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<PrivateRoute roles={['admin']} />}>
              <Route index element={<AdminDashboard />} />
              <Route path="inventory" element={<InventoryReport />} />
              <Route path="export" element={<ExportReport />} />
              <Route path="revenue" element={<RevenueReport />} />
              <Route path="list-products" element={<AdminProductsPage />} />
              <Route path="add-products" element={<AddProducts />} />
              <Route path="expense-report" element={<ExpenseReport />} />
              <Route path="costs-mana" element={<CostsMana />} />
              <Route path="edit-product/:id" element={<EditProductPage />} />
              <Route path="product/:id" element={<ProductDetailDialogAdmin />} />
            </Route>
          </Route>

          {/* Staff Routes with StaffLayout */}
          <Route element={<StaffLayout />}>
            <Route path="/staff" element={<PrivateRoute roles={['admin', 'staff']} />}>
              <Route index element={<InventoryReport />} />
            </Route>
          </Route>

          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
      <ToastContainer />
    </AuthProvider>
  );
}

export default App;