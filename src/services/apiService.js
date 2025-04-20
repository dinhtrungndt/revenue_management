import { apiClient } from './authService';

export const ProductService = {
  // Lấy tất cả sản phẩm
  getAllProducts: async (params = {}) => {
    try {
      const response = await apiClient.get('/api/products', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Lấy sản phẩm theo ID
  getProductById: async (id) => {
    try {
      const response = await apiClient.get(`/api/products/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Tạo sản phẩm mới
  createProduct: async (productData) => {
    try {
      // FormData được sử dụng để upload file
      const response = await apiClient.post('/api/products', productData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Tạo nhiều sản phẩm cùng lúc
  createBulkProducts: async (productsArray) => {
    try {
      const response = await apiClient.post('/api/products/bulk', productsArray);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Cập nhật sản phẩm
  updateProduct: async (id, productData) => {
    try {
      // FormData được sử dụng để upload file
      const response = await apiClient.put(`/api/products/${id}`, productData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Ẩn sản phẩm (thay thế xóa hoàn toàn)
  hideProduct: async (id) => {
    try {
      const response = await apiClient.put(`/api/products/${id}/hide`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Khôi phục sản phẩm đã ẩn
  restoreProduct: async (id) => {
    try {
      const response = await apiClient.put(`/api/products/${id}/restore`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Lấy danh sách sản phẩm đã ẩn
  getHiddenProducts: async () => {
    try {
      const response = await apiClient.get('/api/products/hidden');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Xóa sản phẩm (chỉ sử dụng khi cần thiết)
  deleteProduct: async (id) => {
    try {
      const response = await apiClient.delete(`/api/products/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Test upload ảnh (hữu ích cho debugging)
  testUploadImage: async (imageFile) => {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await apiClient.post('/api/test-upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export const OrderService = {
  // Tạo đơn hàng mới
  createOrder: async (orderData) => {
    try {
      const response = await apiClient.post('/api/orders', orderData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Tạo đơn hàng dịch vụ spa
  createSpaOrder: async (spaOrderData) => {
    try {
      const response = await apiClient.post('/api/orders/spa', spaOrderData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Lấy đơn hàng của người dùng hiện tại
  getUserOrders: async () => {
    try {
      const response = await apiClient.get('/api/orders/me');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Lấy chi tiết đơn hàng theo ID
  getOrderById: async (id) => {
    try {
      const response = await apiClient.get(`/api/orders/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Lấy tất cả đơn hàng (admin/staff only)
  getAllOrders: async (params = {}) => {
    try {
      const response = await apiClient.get('/api/orders', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Cập nhật trạng thái đơn hàng
  updateOrderStatus: async (id, status) => {
    try {
      const response = await apiClient.put(`/api/orders/${id}/status`, { status });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export const InventoryService = {
  // Nhập kho
  importStock: async (importData) => {
    try {
      const response = await apiClient.post('/api/inventory/import', importData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Điều chỉnh tồn kho
  adjustStock: async (adjustData) => {
    try {
      const response = await apiClient.post('/api/inventory/adjust', adjustData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Lấy báo cáo tồn kho
  getInventoryReport: async () => {
    try {
      const response = await apiClient.get('/api/inventory/stock');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Lấy lịch sử giao dịch kho
  getInventoryTransactions: async (params = {}) => {
    try {
      const response = await apiClient.get('/api/inventory/transactions', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Lấy báo cáo xuất kho
  getExportReport: async () => {
    try {
      const response = await apiClient.get('/api/inventory/export');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export const ReportService = {
  // Lấy báo cáo tổng quan dashboard
  getDashboardReport: async () => {
    try {
      const response = await apiClient.get('/api/reports/dashboard');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Lấy báo cáo tồn kho
  getInventoryReport: async (params = {}) => {
    try {
      const response = await apiClient.get('/api/reports/inventory', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Lấy báo cáo xuất kho
  getExportReport: async (params = {}) => {
    try {
      const response = await apiClient.get('/api/reports/export', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Lấy báo cáo doanh thu
  getRevenueReport: async (params = {}) => {
    try {
      const response = await apiClient.get('/api/reports/revenue', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};