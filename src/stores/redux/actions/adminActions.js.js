import { ProductService, OrderService, InventoryService, ReportService } from '../../../services/apiService';
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
            // Tạo một object mới cho tham số API
            const apiParams = { ...params };

            // Lưu lại thông tin sắp xếp để sử dụng sau
            const sortOption = params.sortOption;

            // Xử lý tham số sortOption đặc biệt
            if (params.sortOption) {
                const [field, order] = params.sortOption.split('_');
                apiParams.sort = field;
                apiParams.order = order;
                delete apiParams.sortOption;
            }

            const data = await ProductService.getAllProducts(apiParams);
            dispatch({
                type: FETCH_PRODUCTS,
                payload: data,
                meta: { sortOption } // Truyền thông tin sắp xếp vào action
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
            const data = await ProductService.getProductById(id);
            dispatch({
                type: FETCH_PRODUCT_BY_ID,
                payload: data,
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
            const data = await ProductService.createProduct(productData);
            dispatch({
                type: CREATE_PRODUCT,
                payload: data,
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
            const data = await ProductService.updateProduct(id, productData);
            dispatch({
                type: UPDATE_PRODUCT,
                payload: data,
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
            await ProductService.deleteProduct(id);
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
            const data = await OrderService.createOrder(orderData);
            dispatch({
                type: CREATE_ORDER,
                payload: data,
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
            const data = await OrderService.getUserOrders();
            dispatch({
                type: FETCH_USER_ORDERS,
                payload: data,
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
            const data = await OrderService.getOrderById(id);
            dispatch({
                type: FETCH_ORDER_BY_ID,
                payload: data,
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
            const data = await OrderService.getAllOrders(params);
            dispatch({
                type: FETCH_ALL_ORDERS,
                payload: data,
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
            const data = await OrderService.updateOrderStatus(id, status);
            dispatch({
                type: UPDATE_ORDER_STATUS,
                payload: data,
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
            const data = await InventoryService.importStock(importData);
            dispatch({
                type: IMPORT_STOCK,
                payload: data,
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
            const data = await InventoryService.adjustStock(adjustData);
            dispatch({
                type: ADJUST_STOCK,
                payload: data,
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
            const data = await InventoryService.getInventoryTransactions(params);
            dispatch({
                type: FETCH_INVENTORY_TRANSACTIONS,
                payload: data,
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
            const data = await ReportService.getDashboardReport();
            dispatch({
                type: FETCH_REPORTS_DASHBOARD,
                payload: data,
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
            const data = await ReportService.getInventoryReport(params);
            dispatch({
                type: FETCH_INVENTORY_REPORT,
                payload: data,
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
            const data = await ReportService.getExportReport(params);
            dispatch({
                type: FETCH_EXPORT_REPORT,
                payload: data,
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
            const data = await ReportService.getRevenueReport(params);
            dispatch({
                type: FETCH_REVENUE_REPORT,
                payload: data,
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