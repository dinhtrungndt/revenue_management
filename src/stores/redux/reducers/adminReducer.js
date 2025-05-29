import {
    ADJUST_STOCK,
    ADJUST_STOCK_ERROR, CREATE_EXPENSE, CREATE_ORDER,
    CREATE_ORDER_ERROR, CREATE_PRODUCT,
    CREATE_PRODUCT_ERROR, CREATE_PRODUCT_SUCCESS, CREATE_SPA_ORDER, CREATE_SPA_ORDER_ERROR, CREATE_SPA_ORDER_SUCCESS, DELETE_EXPENSE, DELETE_PRODUCT,
    DELETE_PRODUCT_ERROR, FETCH_ALL_ORDERS,
    FETCH_ALL_ORDERS_ERROR, FETCH_EXPENSES, FETCH_EXPENSES_ERROR, FETCH_EXPENSES_SUCCESS, FETCH_EXPORT_REPORT,
    FETCH_EXPORT_REPORT_ERROR, FETCH_GIFTABLE_PRODUCTS, FETCH_GIFTABLE_PRODUCTS_ERROR, FETCH_GIFTABLE_PRODUCTS_SUCCESS, FETCH_HIDDEN_EXPENSES, FETCH_HIDDEN_EXPENSES_ERROR, FETCH_HIDDEN_EXPENSES_SUCCESS, FETCH_INVENTORY_REPORT,
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
} from '../actions/types';

const initialState = {
    products: [],
    product: null,
    productsLoading: false,
    productsError: null,
    productSuccess: false,
    productDetails: null,
    productDetailsLoading: false,
    productDetailsError: null,
    hiddenProducts: [],
    hiddenProductsLoading: false,
    hiddenProductsError: null,
    restoringProductId: null,
    orders: [],
    order: null,
    inventory: [],
    inventoryTransactions: [],
    reports: {
        dashboard: null,
        inventory: null,
        export: null,
        revenue: null,
        expense: null,
    },
    expenses: [],
    hiddenExpenses: [],
    totalAmount: 0,
    totalHiddenAmount: 0,
    expensesLoading: false,
    expensesError: null,
    hiddenExpensesLoading: false,
    hiddenExpensesError: null,
    loading: false,
    error: null,
};

const adminReducer = (state = initialState, action) => {
    switch (action.type) {
        // Product Cases
        case FETCH_PRODUCTS:
            let sortedProducts = [...action.payload];
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
                productDetails: action.payload,
                productDetailsLoading: action.meta?.loading || false,
                productDetailsError: null,
            };
        case FETCH_GIFTABLE_PRODUCTS:
            return {
                ...state,
                giftableProductsLoading: true,
                giftableProductsError: null,
            };
        case FETCH_GIFTABLE_PRODUCTS_SUCCESS:
            return {
                ...state,
                giftableProducts: action.payload,
                giftableProductsLoading: false,
                giftableProductsError: null,
            };
        case FETCH_GIFTABLE_PRODUCTS_ERROR:
            return {
                ...state,
                giftableProductsLoading: false,
                giftableProductsError: action.payload,
            };
        case CREATE_SPA_ORDER:
            return {
                ...state,
                loading: true,
                error: null,
            };
        case CREATE_SPA_ORDER_SUCCESS:
            return {
                ...state,
                orders: [...state.orders, action.payload],
                loading: false,
                error: null,
            };
        case CREATE_SPA_ORDER_ERROR:
            return {
                ...state,
                loading: false,
                error: action.payload,
            };
        case FETCH_PRODUCTS_HIDDEN:
            return {
                ...state,
                hiddenProducts: action.payload,
                hiddenProductsLoading: false,
                hiddenProductsError: null,
            };
        case HIDE_PRODUCT:
            return {
                ...state,
                products: state.products.filter(p => p._id !== action.payload),
                productDetailsLoading: false,
                productDetailsError: null,
            };
        case HIDE_PRODUCT_ERROR:
            return {
                ...state,
                productDetailsLoading: false,
                productDetailsError: action.payload,
            };
        case 'RESET_PRODUCT_SUCCESS':
            return {
                ...state,
                productSuccess: false,
            };
        case RESTORE_PRODUCT:
            return {
                ...state,
                hiddenProducts: state.hiddenProducts.filter(
                    (product) => product._id !== action.payload._id
                ),
                products: state.products.map((product) =>
                    product._id === action.payload._id ? { ...product, isHidden: false } : product
                ),
                loading: false,
                error: null,
            };
        case 'SET_RESTORING_PRODUCT':
            return {
                ...state,
                restoringProductId: action.payload,
            };
        case FETCH_PRODUCT_BY_ID_ERROR:
            return {
                ...state,
                productDetailsLoading: false,
                productDetailsError: action.payload,
            };
        case CREATE_PRODUCT:
            return {
                ...state,
                productsLoading: true,
                productsError: null,
                productSuccess: false,
            };
        case CREATE_PRODUCT_SUCCESS:
            return {
                ...state,
                products: [...state.products, action.payload],
                productsLoading: false,
                productSuccess: true,
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

        // Expense Cases
        case FETCH_EXPENSES:
            return {
                ...state,
                reports: {
                    ...state.reports,
                    expense: {
                        ...action.payload,
                        totalAmount: action.payload?.total?.amount || 0,
                    },
                },
                loading: action.meta?.loading || false,
                error: null,
            };
        case FETCH_EXPENSES_SUCCESS:
            return {
                ...state,
                expenses: action.payload.expenses,
                totalAmount: action.payload.expenses.reduce((sum, exp) => sum + exp.amount, 0),
                expensesLoading: false,
                expensesError: null,
            };
        case FETCH_EXPENSES_ERROR:
            return {
                ...state,
                expensesLoading: false,
                expensesError: action.payload,
            };
        case FETCH_HIDDEN_EXPENSES:
            return {
                ...state,
                hiddenExpensesLoading: true,
                hiddenExpensesError: null,
            };
        case FETCH_HIDDEN_EXPENSES_SUCCESS:
            return {
                ...state,
                hiddenExpenses: action.payload.expenses,
                totalHiddenAmount: action.payload.expenses.reduce((sum, exp) => sum + exp.amount, 0),
                hiddenExpensesLoading: false,
                hiddenExpensesError: null,
            };
        case FETCH_HIDDEN_EXPENSES_ERROR:
            return {
                ...state,
                hiddenExpensesLoading: false,
                hiddenExpensesError: action.payload,
            };
        case CREATE_EXPENSE:
            return {
                ...state,
                expenses: [...state.expenses, action.payload],
                totalAmount: state.totalAmount + action.payload.amount,
                expensesLoading: false,
                expensesError: null,
            };
        case UPDATE_EXPENSE:
            return {
                ...state,
                expenses: state.expenses.map((expense) =>
                    expense._id === action.payload.id ? action.payload.data : expense
                ),
                hiddenExpenses: state.hiddenExpenses.map((expense) =>
                    expense._id === action.payload.id ? action.payload.data : expense
                ),
                expensesLoading: false,
                expensesError: null,
            };
        case DELETE_EXPENSE:
            return {
                ...state,
                expenses: state.expenses.filter((expense) => expense._id !== action.payload),
                hiddenExpenses: state.hiddenExpenses.filter((expense) => expense._id !== action.payload),
                expensesLoading: false,
                expensesError: null,
            };
        case HIDE_EXPENSE:
            const expenseToHide = state.expenses.find((expense) => expense._id === action.payload);
            return {
                ...state,
                expenses: state.expenses.filter((expense) => expense._id !== action.payload),
                hiddenExpenses: expenseToHide ? [...state.hiddenExpenses, { ...expenseToHide, isHidden: true }] : state.hiddenExpenses,
                totalAmount: state.totalAmount - (expenseToHide?.amount || 0),
                totalHiddenAmount: state.totalHiddenAmount + (expenseToHide?.amount || 0),
                expensesLoading: false,
                expensesError: null,
            };
        case RESTORE_EXPENSE:
            const expenseToRestore = state.hiddenExpenses.find((expense) => expense._id === action.payload);
            return {
                ...state,
                hiddenExpenses: state.hiddenExpenses.filter((expense) => expense._id !== action.payload),
                expenses: expenseToRestore ? [...state.expenses, { ...expenseToRestore, isHidden: false }] : state.expenses,
                totalHiddenAmount: state.totalHiddenAmount - (expenseToRestore?.amount || 0),
                totalAmount: state.totalAmount + (expenseToRestore?.amount || 0),
                expensesLoading: false,
                expensesError: null,
            };
        default:
            return state;
    }
};

export default adminReducer;
