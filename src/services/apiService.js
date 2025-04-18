import { apiClient } from './authService';

// Service xử lý API sản phẩm
export const ProductService = {
  // Lấy danh sách sản phẩm
  getProducts: async (params = {}) => {
    try {
      const response = await apiClient.get('/api/products', { params });
      console.log('Response:', response.data); // Log the response data
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error.response?.data || { message: 'Lỗi khi lấy dữ liệu sản phẩm' };
    }
  },

  // Lấy chi tiết sản phẩm
  getProductById: async (id) => {
    try {
      const response = await apiClient.get(`/api/products/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching product ${id}:`, error);
      throw error.response?.data || { message: 'Lỗi khi lấy chi tiết sản phẩm' };
    }
  },

  // Thêm sản phẩm mới (Admin only)
  createProduct: async (productData) => {
    try {
      const response = await apiClient.post('/api/products', productData);
      return response.data;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error.response?.data || { message: 'Lỗi khi tạo sản phẩm mới' };
    }
  },

  // Cập nhật sản phẩm (Admin only)
  updateProduct: async (id, productData) => {
    try {
      const response = await apiClient.put(`/api/products/${id}`, productData);
      return response.data;
    } catch (error) {
      console.error(`Error updating product ${id}:`, error);
      throw error.response?.data || { message: 'Lỗi khi cập nhật sản phẩm' };
    }
  },

  // Xóa sản phẩm (Admin only)
  deleteProduct: async (id) => {
    try {
      const response = await apiClient.delete(`/api/products/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting product ${id}:`, error);
      throw error.response?.data || { message: 'Lỗi khi xóa sản phẩm' };
    }
  }
};

// Service xử lý API đơn hàng
export const OrderService = {
  // Tạo đơn hàng mới
  createOrder: async (orderData) => {
    try {
      const response = await apiClient.post('/api/orders', orderData);
      return response.data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error.response?.data || { message: 'Lỗi khi tạo đơn hàng' };
    }
  },

  // Lấy danh sách đơn hàng cá nhân
  getUserOrders: async () => {
    try {
      const response = await apiClient.get('/api/orders/me');
      return response.data;
    } catch (error) {
      console.error('Error fetching user orders:', error);
      throw error.response?.data || { message: 'Lỗi khi lấy danh sách đơn hàng' };
    }
  },

  // Lấy chi tiết đơn hàng
  getOrderById: async (id) => {
    try {
      const response = await apiClient.get(`/api/orders/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching order ${id}:`, error);
      throw error.response?.data || { message: 'Lỗi khi lấy chi tiết đơn hàng' };
    }
  },

  // Lấy tất cả đơn hàng (Admin/Staff only)
  getAllOrders: async (params = {}) => {
    try {
      const response = await apiClient.get('/api/orders', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching all orders:', error);
      throw error.response?.data || { message: 'Lỗi khi lấy tất cả đơn hàng' };
    }
  },

  // Cập nhật trạng thái đơn hàng (Admin/Staff only)
  updateOrderStatus: async (id, status) => {
    try {
      const response = await apiClient.put(`/api/orders/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.error(`Error updating order ${id} status:`, error);
      throw error.response?.data || { message: 'Lỗi khi cập nhật trạng thái đơn hàng' };
    }
  }
};

// Service xử lý API báo cáo
export const ReportService = {
  // Báo cáo tổng quan Dashboard (Admin only)
  getDashboardReport: async () => {
    try {
      const response = await apiClient.get('/api/reports/dashboard');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard report:', error);
      throw error.response?.data || { message: 'Lỗi khi lấy báo cáo tổng quan' };
    }
  },

  // Báo cáo tồn kho (Admin/Staff)
  getInventoryReport: async (params = {}) => {
    try {
      const response = await apiClient.get('/api/reports/inventory', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching inventory report:', error);
      throw error.response?.data || { message: 'Lỗi khi lấy báo cáo tồn kho' };
    }
  },

  // Báo cáo xuất kho (Admin only)
  getExportReport: async (params = {}) => {
    try {
      const response = await apiClient.get('/api/reports/export', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching export report:', error);
      throw error.response?.data || { message: 'Lỗi khi lấy báo cáo xuất kho' };
    }
  },

  // Báo cáo doanh thu (Admin only)
  getRevenueReport: async (params = {}) => {
    try {
      const response = await apiClient.get('/api/reports/revenue', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching revenue report:', error);
      throw error.response?.data || { message: 'Lỗi khi lấy báo cáo doanh thu' };
    }
  }
};

// Service xử lý API kho hàng
export const InventoryService = {
  // Nhập kho (Admin only)
  importStock: async (importData) => {
    try {
      const response = await apiClient.post('/api/inventory/import', importData);
      return response.data;
    } catch (error) {
      console.error('Error importing stock:', error);
      throw error.response?.data || { message: 'Lỗi khi nhập kho' };
    }
  },

  // Điều chỉnh tồn kho (Admin only)
  adjustStock: async (adjustData) => {
    try {
      const response = await apiClient.post('/api/inventory/adjust', adjustData);
      return response.data;
    } catch (error) {
      console.error('Error adjusting stock:', error);
      throw error.response?.data || { message: 'Lỗi khi điều chỉnh tồn kho' };
    }
  },

  // Lấy lịch sử giao dịch kho (Admin only)
  getInventoryTransactions: async (params = {}) => {
    try {
      const response = await apiClient.get('/api/inventory/transactions', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching inventory transactions:', error);
      throw error.response?.data || { message: 'Lỗi khi lấy lịch sử giao dịch kho' };
    }
  }
};