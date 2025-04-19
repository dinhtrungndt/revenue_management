const API_CONFIG = {
  // BASE_URL: process.env.REACT_APP_API_URL,
  BASE_URL: 'http://192.168.1.23:8080',
  // Timeout request (ms)
  TIMEOUT: 30000,
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

// Auth Configuration
const AUTH_CONFIG = {
  // Key lưu token trong localStorage
  TOKEN_KEY: 'pet_food_token',
  // Key lưu thông tin user trong localStorage
  USER_KEY: 'pet_food_user',
  // Thời gian hết hạn token (ms) - 30 ngày
  TOKEN_EXPIRATION: 30 * 24 * 60 * 60 * 1000
};

// App Configuration
const APP_CONFIG = {
  // Tên ứng dụng
  APP_NAME: 'Shop Thú Cưng',
  // Mặc định số sản phẩm mỗi trang
  DEFAULT_PAGE_SIZE: 10,
  // Các loại sản phẩm
  PRODUCT_CATEGORIES: [
    { value: 'dog', label: 'Thức ăn cho chó' },
    { value: 'cat', label: 'Thức ăn cho mèo' },
    // { value: 'spa', label: 'Spa (Chăm sóc thú cưng)' }
  ],
  // Trạng thái đơn hàng
  ORDER_STATUSES: [
    { value: 'Đã đặt hàng', label: 'Đã đặt hàng' },
    { value: 'Đang xử lý', label: 'Đang xử lý' },
    { value: 'Đang giao hàng', label: 'Đang giao hàng' },
    { value: 'Đã giao hàng', label: 'Đã giao hàng' },
    { value: 'Đã hủy', label: 'Đã hủy' }
  ]
};

export { API_CONFIG, AUTH_CONFIG, APP_CONFIG };