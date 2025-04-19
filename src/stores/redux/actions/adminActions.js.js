import { apiClient } from '../../../services/authService';
import {
  FETCH_PRODUCTS,
  FETCH_PRODUCTS_ERROR,
  FETCH_PRODUCT_BY_ID,
  FETCH_PRODUCT_BY_ID_ERROR,
  CREATE_PRODUCT,
  CREATE_PRODUCT_ERROR,
  UPDATE_PRODUCT,
  UPDATE_PRODUCT_ERROR,
  DELETE_PRODUCT,
  DELETE_PRODUCT_ERROR,
  CREATE_ORDER,
  CREATE_ORDER_ERROR,
  FETCH_USER_ORDERS,
  FETCH_USER_ORDERS_ERROR,
  FETCH_ORDER_BY_ID,
  FETCH_ORDER_BY_ID_ERROR,
  FETCH_ALL_ORDERS,
  FETCH_ALL_ORDERS_ERROR,
  UPDATE_ORDER_STATUS,
  UPDATE_ORDER_STATUS_ERROR,
  IMPORT_STOCK,
  IMPORT_STOCK_ERROR,
  ADJUST_STOCK,
  ADJUST_STOCK_ERROR,
  FETCH_INVENTORY_TRANSACTIONS,
  FETCH_INVENTORY_TRANSACTIONS_ERROR,
  FETCH_REPORTS_DASHBOARD,
  FETCH_REPORTS_DASHBOARD_ERROR,
  FETCH_INVENTORY_REPORT,
  FETCH_INVENTORY_REPORT_ERROR,
  FETCH_EXPORT_REPORT,
  FETCH_EXPORT_REPORT_ERROR,
  FETCH_REVENUE_REPORT,
  FETCH_REVENUE_REPORT_ERROR,
} from './types';

// Product Actions
export const fetchProducts = (params = {}) => {
  return async (dispatch) => {
    try {
      const response = await apiClient.get('/api/products', { params });
      dispatch({
        type: FETCH_PRODUCTS,
        payload: response.data,
      });
    } catch (error) {
      console.error('Error fetching products:', error);
      dispatch({
        type: FETCH_PRODUCTS_ERROR,
        payload: error.response?.data || { message: 'Lỗi khi lấy dữ liệu sản phẩm' },
      });
    }
  };
};

export const fetchProductById = (id) => {
  return async (dispatch) => {
    try {
      const response = await apiClient.get(`/api/products/${id}`);
      dispatch({
        type: FETCH_PRODUCT_BY_ID,
        payload: response.data,
      });
    } catch (error) {
      console.error(`Error fetching product ${id}:`, error);
      dispatch({
        type: FETCH_PRODUCT_BY_ID_ERROR,
        payload: error.response?.data || { message: 'Lỗi khi lấy chi tiết sản phẩm' },
      });
    }
  };
};

export const createProduct = (productData) => {
  return async (dispatch) => {
    try {
      const response = await apiClient.post('/api/products', productData);
      dispatch({
        type: CREATE_PRODUCT,
        payload: response.data,
      });
    } catch (error) {
      console.error('Error creating product:', error);
      dispatch({
        type: CREATE_PRODUCT_ERROR,
        payload: error.response?.data || { message: 'Lỗi khi tạo sản phẩm mới' },
      });
    }
  };
};

export const updateProduct = (id, productData) => {
  return async (dispatch) => {
    try {
      const response = await apiClient.put(`/api/products/${id}`, productData);
      dispatch({
        type: UPDATE_PRODUCT,
        payload: response.data,
      });
    } catch (error) {
      console.error(`Error updating product ${id}:`, error);
      dispatch({
        type: UPDATE_PRODUCT_ERROR,
        payload: error.response?.data || { message: 'Lỗi khi cập nhật sản phẩm' },
      });
    }
  };
};

export const deleteProduct = (id) => {
  return async (dispatch) => {
    try {
      await apiClient.delete(`/api/products/${id}`);
      dispatch({
        type: DELETE_PRODUCT,
        payload: { id },
      });
    } catch (error) {
      console.error(`Error deleting product ${id}:`, error);
      dispatch({
        type: DELETE_PRODUCT_ERROR,
        payload: error.response?.data || { message: 'Lỗi khi xóa sản phẩm' },
      });
    }
  };
};

// Order Actions
export const createOrder = (orderData) => {
  return async (dispatch) => {
    try {
      const response = await apiClient.post('/api/orders', orderData);
      dispatch({
        type: CREATE_ORDER,
        payload: response.data,
      });
    } catch (error) {
      console.error('Error creating order:', error);
      dispatch({
        type: CREATE_ORDER_ERROR,
        payload: error.response?.data || { message: 'Lỗi khi tạo đơn hàng' },
      });
    }
  };
};

export const fetchUserOrders = () => {
  return async (dispatch) => {
    try {
      const response = await apiClient.get('/api/orders/me');
      dispatch({
        type: FETCH_USER_ORDERS,
        payload: response.data,
      });
    } catch (error) {
      console.error('Error fetching user orders:', error);
      dispatch({
        type: FETCH_USER_ORDERS_ERROR,
        payload: error.response?.data || { message: 'Lỗi khi lấy danh sách đơn hàng' },
      });
    }
  };
};

export const fetchOrderById = (id) => {
  return async (dispatch) => {
    try {
      const response = await apiClient.get(`/api/orders/${id}`);
      dispatch({
        type: FETCH_ORDER_BY_ID,
        payload: response.data,
      });
    } catch (error) {
      console.error(`Error fetching order ${id}:`, error);
      dispatch({
        type: FETCH_ORDER_BY_ID_ERROR,
        payload: error.response?.data || { message: 'Lỗi khi lấy chi tiết đơn hàng' },
      });
    }
  };
};

export const fetchAllOrders = (params = {}) => {
  return async (dispatch) => {
    try {
      const response = await apiClient.get('/api/orders', { params });
      dispatch({
        type: FETCH_ALL_ORDERS,
        payload: response.data,
      });
    } catch (error) {
      console.error('Error fetching all orders:', error);
      dispatch({
        type: FETCH_ALL_ORDERS_ERROR,
        payload: error.response?.data || { message: 'Lỗi khi lấy tất cả đơn hàng' },
      });
    }
  };
};

export const updateOrderStatus = (id, status) => {
  return async (dispatch) => {
    try {
      const response = await apiClient.put(`/api/orders/${id}/status`, { status });
      dispatch({
        type: UPDATE_ORDER_STATUS,
        payload: response.data,
      });
    } catch (error) {
      console.error(`Error updating order ${id} status:`, error);
      dispatch({
        type: UPDATE_ORDER_STATUS_ERROR,
        payload: error.response?.data || { message: 'Lỗi khi cập nhật trạng thái đơn hàng' },
      });
    }
  };
};

// Inventory Actions
export const importStock = (importData) => {
  return async (dispatch) => {
    try {
      const response = await apiClient.post('/api/inventory/import', importData);
      dispatch({
        type: IMPORT_STOCK,
        payload: response.data,
      });
    } catch (error) {
      console.error('Error importing stock:', error);
      dispatch({
        type: IMPORT_STOCK_ERROR,
        payload: error.response?.data || { message: 'Lỗi khi nhập kho' },
      });
    }
  };
};

export const adjustStock = (adjustData) => {
  return async (dispatch) => {
    try {
      const response = await apiClient.post('/api/inventory/adjust', adjustData);
      dispatch({
        type: ADJUST_STOCK,
        payload: response.data,
      });
    } catch (error) {
      console.error('Error adjusting stock:', error);
      dispatch({
        type: ADJUST_STOCK_ERROR,
        payload: error.response?.data || { message: 'Lỗi khi điều chỉnh tồn kho' },
      });
    }
  };
};

export const fetchInventoryTransactions = (params = {}) => {
  return async (dispatch) => {
    try {
      const response = await apiClient.get('/api/inventory/transactions', { params });
      dispatch({
        type: FETCH_INVENTORY_TRANSACTIONS,
        payload: response.data,
      });
    } catch (error) {
      console.error('Error fetching inventory transactions:', error);
      dispatch({
        type: FETCH_INVENTORY_TRANSACTIONS_ERROR,
        payload: error.response?.data || { message: 'Lỗi khi lấy lịch sử giao dịch kho' },
      });
    }
  };
};

// Report Actions
export const fetchReportDashboard = () => {
  return async (dispatch) => {
    try {
      const response = await apiClient.get('/api/reports/dashboard');
      dispatch({
        type: FETCH_REPORTS_DASHBOARD,
        payload: response.data,
      });
    } catch (error) {
      console.error('Error fetching dashboard report:', error);
      dispatch({
        type: FETCH_REPORTS_DASHBOARD_ERROR,
        payload: error.message || 'Lỗi khi lấy báo cáo tổng quan',
      });
    }
  };
};

export const fetchInventoryReport = (params = {}) => {
  return async (dispatch) => {
    try {
      const response = await apiClient.get('/api/reports/inventory', { params });
      dispatch({
        type: FETCH_INVENTORY_REPORT,
        payload: response.data,
      });
    } catch (error) {
      console.error('Error fetching inventory report:', error);
      dispatch({
        type: FETCH_INVENTORY_REPORT_ERROR,
        payload: error.message || 'Lỗi khi lấy báo cáo tồn kho',
      });
    }
  };
};

export const fetchExportReport = (params = {}) => {
  return async (dispatch) => {
    try {
      const response = await apiClient.get('/api/reports/export', { params });
      dispatch({
        type: FETCH_EXPORT_REPORT,
        payload: response.data,
      });
    } catch (error) {
      console.error('Error fetching export report:', error);
      dispatch({
        type: FETCH_EXPORT_REPORT_ERROR,
        payload: error.message || 'Lỗi khi lấy báo cáo xuất kho',
      });
    }
  };
};

export const fetchRevenueReport = (params = {}) => {
  return async (dispatch) => {
    try {
      const response = await apiClient.get('/api/reports/revenue', { params });
      dispatch({
        type: FETCH_REVENUE_REPORT,
        payload: response.data,
      });
    } catch (error) {
      console.error('Error fetching revenue report:', error);
      dispatch({
        type: FETCH_REVENUE_REPORT_ERROR,
        payload: error.message || 'Lỗi khi lấy báo cáo doanh thu',
      });
    }
  };
};