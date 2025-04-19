import {
    FETCH_REPORTS_DASHBOARD,
    FETCH_REPORTS_DASHBOARD_ERROR,
    FETCH_INVENTORY_REPORT,
    FETCH_INVENTORY_REPORT_ERROR,
    FETCH_EXPORT_REPORT,
    FETCH_EXPORT_REPORT_ERROR,
    FETCH_REVENUE_REPORT,
    FETCH_REVENUE_REPORT_ERROR,
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
} from '../actions/types';

const initialState = {
    products: [],
    product: null,
    orders: [],
    order: null,
    inventory: [],
    inventoryTransactions: [],
    reports: {
        dashboard: null,
        inventory: null,
        export: null,
        revenue: null,
    },
    loading: false,
    error: null,
};

const adminReducer = (state = initialState, action) => {
    switch (action.type) {
        // Product Cases
        case FETCH_PRODUCTS:
            let sortedProducts = [...action.payload];

            // Lấy thông tin sắp xếp từ action nếu có
            if (action.meta && action.meta.sortOption) {
                const [field, order] = action.meta.sortOption.split('_');

                sortedProducts.sort((a, b) => {
                    if (order === 'asc') {
                        return a[field] > b[field] ? 1 : -1;
                    } else {
                        return a[field] < b[field] ? 1 : -1;
                    }
                });
            }

            return {
                ...state,
                products: sortedProducts,
                loading: false,
                error: null,
            };
        case FETCH_PRODUCTS_ERROR:
            return {
                ...state,
                loading: false,
                error: action.payload,
            };
        case FETCH_PRODUCT_BY_ID:
            return {
                ...state,
                product: action.payload,
                loading: false,
                error: null,
            };
        case FETCH_PRODUCT_BY_ID_ERROR:
            return {
                ...state,
                loading: false,
                error: action.payload,
            };
        case CREATE_PRODUCT:
            return {
                ...state,
                products: [...state.products, action.payload],
                loading: false,
                error: null,
            };
        case CREATE_PRODUCT_ERROR:
            return {
                ...state,
                loading: false,
                error: action.payload,
            };
        case UPDATE_PRODUCT:
            return {
                ...state,
                products: state.products.map((product) =>
                    product._id === action.payload._id ? action.payload : product
                ),
                loading: false,
                error: null,
            };
        case UPDATE_PRODUCT_ERROR:
            return {
                ...state,
                loading: false,
                error: action.payload,
            };
        case DELETE_PRODUCT:
            return {
                ...state,
                products: state.products.filter((product) => product._id !== action.payload.id),
                loading: false,
                error: null,
            };
        case DELETE_PRODUCT_ERROR:
            return {
                ...state,
                loading: false,
                error: action.payload,
            };

        // Order Cases
        case CREATE_ORDER:
            return {
                ...state,
                orders: [...state.orders, action.payload],
                loading: false,
                error: null,
            };
        case CREATE_ORDER_ERROR:
            return {
                ...state,
                loading: false,
                error: action.payload,
            };
        case FETCH_USER_ORDERS:
            return {
                ...state,
                orders: action.payload,
                loading: false,
                error: null,
            };
        case FETCH_USER_ORDERS_ERROR:
            return {
                ...state,
                loading: false,
                error: action.payload,
            };
        case FETCH_ORDER_BY_ID:
            return {
                ...state,
                order: action.payload,
                loading: false,
                error: null,
            };
        case FETCH_ORDER_BY_ID_ERROR:
            return {
                ...state,
                loading: false,
                error: action.payload,
            };
        case FETCH_ALL_ORDERS:
            return {
                ...state,
                orders: action.payload,
                loading: false,
                error: null,
            };
        case FETCH_ALL_ORDERS_ERROR:
            return {
                ...state,
                loading: false,
                error: action.payload,
            };
        case UPDATE_ORDER_STATUS:
            return {
                ...state,
                orders: state.orders.map((order) =>
                    order._id === action.payload._id ? action.payload : order
                ),
                loading: false,
                error: null,
            };
        case UPDATE_ORDER_STATUS_ERROR:
            return {
                ...state,
                loading: false,
                error: action.payload,
            };

        // Inventory Cases
        case IMPORT_STOCK:
            return {
                ...state,
                inventory: action.payload,
                loading: false,
                error: null,
            };
        case IMPORT_STOCK_ERROR:
            return {
                ...state,
                loading: false,
                error: action.payload,
            };
        case ADJUST_STOCK:
            return {
                ...state,
                inventory: action.payload,
                loading: false,
                error: null,
            };
        case ADJUST_STOCK_ERROR:
            return {
                ...state,
                loading: false,
                error: action.payload,
            };
        case FETCH_INVENTORY_TRANSACTIONS:
            return {
                ...state,
                inventoryTransactions: action.payload,
                loading: false,
                error: null,
            };
        case FETCH_INVENTORY_TRANSACTIONS_ERROR:
            return {
                ...state,
                loading: false,
                error: action.payload,
            };

        // Report Cases
        case FETCH_REPORTS_DASHBOARD:
            return {
                ...state,
                reports: {
                    ...state.reports,
                    dashboard: action.payload,
                },
                loading: false,
                error: null,
            };
        case FETCH_REPORTS_DASHBOARD_ERROR:
            return {
                ...state,
                loading: false,
                error: action.payload,
            };
        case FETCH_INVENTORY_REPORT:
            return {
                ...state,
                reports: {
                    ...state.reports,
                    inventory: action.payload,
                },
                loading: false,
                error: null,
            };
        case FETCH_INVENTORY_REPORT_ERROR:
            return {
                ...state,
                loading: false,
                error: action.payload,
            };
        case FETCH_EXPORT_REPORT:
            return {
                ...state,
                reports: {
                    ...state.reports,
                    export: action.payload,
                },
                loading: false,
                error: null,
            };
        case FETCH_EXPORT_REPORT_ERROR:
            return {
                ...state,
                loading: false,
                error: action.payload,
            };
        case FETCH_REVENUE_REPORT:
            return {
                ...state,
                reports: {
                    ...state.reports,
                    revenue: action.payload,
                },
                loading: false,
                error: null,
            };
        case FETCH_REVENUE_REPORT_ERROR:
            return {
                ...state,
                loading: false,
                error: action.payload,
            };
        default:
            return state;
    }
};

export default adminReducer;