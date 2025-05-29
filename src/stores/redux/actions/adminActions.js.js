import { ExpenseService, InventoryService, OrderService, ProductService, ReportService } from '../../../services/apiService';
import {
    ADJUST_STOCK,
    ADJUST_STOCK_ERROR, CREATE_EXPENSE, CREATE_ORDER,
    CREATE_ORDER_ERROR, CREATE_PRODUCT,
    CREATE_PRODUCT_ERROR, CREATE_PRODUCT_SUCCESS, CREATE_SPA_ORDER, CREATE_SPA_ORDER_ERROR, CREATE_SPA_ORDER_SUCCESS, DELETE_EXPENSE, DELETE_PRODUCT,
    DELETE_PRODUCT_ERROR, FETCH_ALL_ORDERS,
    FETCH_ALL_ORDERS_ERROR, FETCH_EXPENSES,
    FETCH_EXPENSES_ERROR, FETCH_EXPENSES_SUCCESS, FETCH_EXPORT_REPORT,
    FETCH_EXPORT_REPORT_ERROR, FETCH_GIFTABLE_PRODUCTS,
    FETCH_GIFTABLE_PRODUCTS_ERROR, FETCH_GIFTABLE_PRODUCTS_SUCCESS, FETCH_HIDDEN_EXPENSES, FETCH_HIDDEN_EXPENSES_ERROR, FETCH_HIDDEN_EXPENSES_SUCCESS, FETCH_INVENTORY_REPORT,
    FETCH_INVENTORY_REPORT_ERROR, FETCH_INVENTORY_TRANSACTIONS,
    FETCH_INVENTORY_TRANSACTIONS_ERROR, FETCH_ORDER_BY_ID,
    FETCH_ORDER_BY_ID_ERROR, FETCH_PRODUCTS,
    FETCH_PRODUCTS_ERROR, FETCH_PRODUCTS_HIDDEN, FETCH_PRODUCT_BY_ID,
    FETCH_PRODUCT_BY_ID_ERROR, FETCH_REPORTS_DASHBOARD,
    FETCH_REPORTS_DASHBOARD_ERROR, FETCH_REVENUE_REPORT,
    FETCH_REVENUE_REPORT_ERROR, FETCH_USER_ORDERS,
    FETCH_USER_ORDERS_ERROR, HIDE_EXPENSE, HIDE_PRODUCT,
    HIDE_PRODUCT_ERROR, IMPORT_STOCK,
    IMPORT_STOCK_ERROR, RESTORE_EXPENSE, RESTORE_PRODUCT, UPDATE_EXPENSE, UPDATE_ORDER_STATUS,
    UPDATE_ORDER_STATUS_ERROR, UPDATE_PRODUCT,
    UPDATE_PRODUCT_ERROR
} from './types';

// Action để đặt trạng thái khôi phục
export const setRestoringProduct = (id) => ({
    type: 'SET_RESTORING_PRODUCT',
    payload: id,
});

// Product Actions
export const fetchProducts = (params = {}) => {
    return async (dispatch) => {
        try {
            const apiParams = { ...params };
            const sortOption = params.sortOption;
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
                meta: { sortOption }
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

export const fetchProductById = (productId) => {
    return async (dispatch) => {
        try {
            dispatch({ type: FETCH_PRODUCT_BY_ID, meta: { loading: true } });
            const data = await ProductService.getProductById(productId);
            dispatch({
                type: FETCH_PRODUCT_BY_ID,
                payload: data,
            });
        } catch (error) {
            console.error('Error fetching product details:', error);
            dispatch({
                type: FETCH_PRODUCT_BY_ID_ERROR,
                payload: error.response?.data || { message: 'Lỗi khi lấy chi tiết sản phẩm' },
            });
        }
    };
};

export const fetchGiftableProducts = () => {
    return async (dispatch) => {
        try {
            dispatch({ type: FETCH_GIFTABLE_PRODUCTS, meta: { loading: true } });
            const data = await ProductService.getGiftableProducts();
            dispatch({
                type: FETCH_GIFTABLE_PRODUCTS_SUCCESS,
                payload: data,
            });
            return data;
        } catch (error) {
            console.error('Error fetching giftable products:', error);
            dispatch({
                type: FETCH_GIFTABLE_PRODUCTS_ERROR,
                payload: error.response?.data || { message: 'Lỗi khi lấy danh sách quà tặng' },
            });
            throw error;
        }
    };
};

export const createSpaOrder = (spaOrderData) => {
    return async (dispatch) => {
        try {
            dispatch({ type: CREATE_SPA_ORDER, meta: { loading: true } });
            const data = await OrderService.createSpaOrder(spaOrderData);
            dispatch({
                type: CREATE_SPA_ORDER_SUCCESS,
                payload: data,
            });
            return data;
        } catch (error) {
            console.error('Error creating spa order:', error);
            dispatch({
                type: CREATE_SPA_ORDER_ERROR,
                payload: error.response?.data || { message: 'Lỗi khi tạo đơn hàng dịch vụ spa' },
            });
            throw error;
        }
    };
};

export const hideProduct = (productId) => {
    return async (dispatch) => {
        try {
            dispatch({ type: HIDE_PRODUCT, meta: { loading: true } });
            await ProductService.hideProduct(productId);
            dispatch({
                type: HIDE_PRODUCT,
                payload: productId,
            });
            dispatch(fetchProducts());
        } catch (error) {
            console.error('Error hiding product:', error);
            dispatch({
                type: HIDE_PRODUCT_ERROR,
                payload: error.response?.data || { message: 'Lỗi khi ẩn sản phẩm' },
            });
        }
    };
};

export const fetchHiddenProducts = () => {
    return async (dispatch) => {
        try {
            dispatch({
                type: FETCH_PRODUCTS_HIDDEN,
                payload: [],
                meta: { loading: true }
            });
            const data = await ProductService.getHiddenProducts();
            dispatch({
                type: FETCH_PRODUCTS_HIDDEN,
                payload: data,
            });
        } catch (error) {
            console.error('Error fetching hidden products:', error);
            dispatch({
                type: FETCH_PRODUCTS_ERROR,
                payload: error.response?.data || { message: 'Lỗi khi lấy sản phẩm ẩn' },
            });
        }
    };
};

export const fetchRestoreProducts = (id) => {
    return async (dispatch) => {
        try {
            dispatch(setRestoringProduct(id));
            const data = await ProductService.restoreProduct(id);
            dispatch({
                type: RESTORE_PRODUCT,
                payload: data,
            });
        } catch (error) {
            console.error(`Error restoring product ${id}:`, error);
            dispatch({
                type: FETCH_PRODUCTS_ERROR,
                payload: error.response?.data || { message: 'Lỗi khi khôi phục sản phẩm' },
            });
        } finally {
            dispatch(setRestoringProduct(null));
        }
    };
};

export const createProduct = (productData) => {
    return async (dispatch) => {
        try {
            dispatch({ type: CREATE_PRODUCT });
            const data = await ProductService.createProduct(productData);
            dispatch({
                type: CREATE_PRODUCT_SUCCESS,
                payload: data,
            });
            dispatch(fetchProducts());
        } catch (error) {
            console.error('Error creating product:', error);
            dispatch({
                type: CREATE_PRODUCT_ERROR,
                payload: error.response?.data || { message: 'Lỗi khi thêm sản phẩm' },
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

// Expense Actions
export const fetchExpenses = (params = {}) => async (dispatch) => {
    try {
        dispatch({ type: FETCH_EXPENSES, meta: { loading: true } });
        const data = await ExpenseService.getExpenses(params);
        dispatch({
            type: FETCH_EXPENSES_SUCCESS,
            payload: data,
        });
    } catch (error) {
        console.error('Error fetching expenses:', error);
        dispatch({
            type: FETCH_EXPENSES_ERROR,
            payload: error.response?.data || { message: 'Lỗi khi lấy danh sách chi phí' },
        });
    }
};

// Fetch hidden expenses
export const fetchHiddenExpenses = (params = {}) => async (dispatch) => {
    try {
        dispatch({ type: FETCH_HIDDEN_EXPENSES, meta: { loading: true } });
        const data = await ExpenseService.getHiddenExpenses(params);
        dispatch({
            type: FETCH_HIDDEN_EXPENSES_SUCCESS,
            payload: data,
        });
    } catch (error) {
        console.error('Error fetching hidden expenses:', error);
        dispatch({
            type: FETCH_HIDDEN_EXPENSES_ERROR,
            payload: error.response?.data || { message: 'Lỗi khi lấy danh sách chi phí ẩn' },
        });
    }
};

// Create expense
export const createExpense = (expenseData) => async (dispatch) => {
    try {
        const data = await ExpenseService.createExpense(expenseData);
        dispatch({
            type: CREATE_EXPENSE,
            payload: data,
        });
        // Đồng bộ báo cáo chi phí
        dispatch(fetchExpenseReport());
        return data;
    } catch (error) {
        console.error('Error creating expense:', error);
        throw error.response?.data || { message: 'Lỗi khi tạo chi phí mới' };
    }
};

// Update expense
export const updateExpense = (id, expenseData) => async (dispatch) => {
    try {
        const data = await ExpenseService.updateExpense(id, expenseData);
        dispatch({
            type: UPDATE_EXPENSE,
            payload: { id, data },
        });
        // Đồng bộ báo cáo chi phí
        dispatch(fetchExpenseReport());
        return data;
    } catch (error) {
        console.error(`Error updating expense ${id}:`, error);
        throw error.response?.data || { message: 'Lỗi khi cập nhật chi phí' };
    }
};

// Delete expense
export const deleteExpense = (id) => async (dispatch) => {
    try {
        await ExpenseService.deleteExpense(id);
        dispatch({
            type: DELETE_EXPENSE,
            payload: id,
        });
        // Đồng bộ báo cáo chi phí
        dispatch(fetchExpenseReport());
    } catch (error) {
        console.error(`Error deleting expense ${id}:`, error);
        throw error.response?.data || { message: 'Lỗi khi xóa chi phí' };
    }
};

// Hide expense
export const hideExpense = (id) => async (dispatch) => {
    try {
        await ExpenseService.hideExpense(id);
        dispatch({
            type: HIDE_EXPENSE,
            payload: id,
        });
        // Đồng bộ báo cáo chi phí
        dispatch(fetchExpenseReport());
    } catch (error) {
        console.error(`Error hiding expense ${id}:`, error);
        throw error.response?.data || { message: 'Lỗi khi ẩn chi phí' };
    }
};

// Restore expense
export const restoreExpense = (id) => async (dispatch) => {
    try {
        await ExpenseService.restoreExpense(id);
        dispatch({
            type: RESTORE_EXPENSE,
            payload: id,
        });
        // Đồng bộ báo cáo chi phí
        dispatch(fetchExpenseReport());
    } catch (error) {
        console.error(`Error restoring expense ${id}:`, error);
        throw error.response?.data || { message: 'Lỗi khi khôi phục chi phí' };
    }
};

// Fetch expense report (hiện có, giữ nguyên)
export const fetchExpenseReport = (params = {}) => {
    return async (dispatch) => {
        try {
            dispatch({
                type: FETCH_EXPENSES,
                payload: null,
                meta: { loading: true },
            });
            const data = await ExpenseService.getExpenseReport(params);
            dispatch({
                type: FETCH_EXPENSES,
                payload: {
                    ...data,
                    totalAmount: data.byMonth?.reduce((sum, month) => sum + month.amount, 0) || 0,
                },
            });
            dispatch(fetchExpenses(params));
            dispatch(fetchHiddenExpenses(params));
        } catch (error) {
            console.error('Error fetching expense report:', error);
            dispatch({
                type: FETCH_EXPENSES_ERROR,
                payload: error.response?.data || { message: 'Lỗi khi lấy báo cáo chi phí' },
            });
        }
    };
};
