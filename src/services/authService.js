import axios from 'axios';
import { API_CONFIG, AUTH_CONFIG } from '../config';

// Tạo instance axios với config
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.HEADERS
});

// Đăng ký tài khoản
export const register = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);

    if (response.data && response.data.token) {
      // Lưu token và user vào localStorage
      localStorage.setItem(AUTH_CONFIG.TOKEN_KEY, response.data.token);
      localStorage.setItem(AUTH_CONFIG.USER_KEY, JSON.stringify(response.data));
    }

    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Lỗi kết nối server' };
  }
};

// Đăng nhập
export const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });

    if (response.data && response.data.token) {
      // Lưu token và user vào localStorage
      localStorage.setItem(AUTH_CONFIG.TOKEN_KEY, response.data.token);
      localStorage.setItem(AUTH_CONFIG.USER_KEY, JSON.stringify(response.data));
    }

    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Lỗi kết nối server' };
  }
};

// Đăng xuất
export const logout = () => {
  // Xóa thông tin người dùng khỏi localStorage
  localStorage.removeItem(AUTH_CONFIG.TOKEN_KEY);
  localStorage.removeItem(AUTH_CONFIG.USER_KEY);
};

// Lấy thông tin người dùng hiện tại từ localStorage
export const getCurrentUser = () => {
  const userStr = localStorage.getItem(AUTH_CONFIG.USER_KEY);
  if (!userStr) return null;

  try {
    return JSON.parse(userStr);
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

// Kiểm tra token còn hạn hay không
export const isTokenValid = () => {
  const token = localStorage.getItem(AUTH_CONFIG.TOKEN_KEY);
  if (!token) return false;

  // Thêm logic kiểm tra hạn token nếu cần
  // (JWT thường đã có hạn trong payload, nhưng client cũng có thể kiểm tra thêm)

  return true;
};

// Lấy thông tin user profile từ API
export const getUserProfile = async () => {
  try {
    const token = localStorage.getItem(AUTH_CONFIG.TOKEN_KEY);

    if (!token) {
      throw new Error('Không tìm thấy token xác thực');
    }

    const response = await api.get('/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    // Cập nhật thông tin user trong localStorage
    const currentUser = getCurrentUser();
    if (currentUser) {
      const updatedUser = { ...currentUser, ...response.data };
      localStorage.setItem(AUTH_CONFIG.USER_KEY, JSON.stringify(updatedUser));
    }

    return response.data;
  } catch (error) {
    logout(); // Đăng xuất nếu có lỗi
    throw error.response?.data || { message: 'Lỗi kết nối server' };
  }
};

// Thêm token xác thực vào header trong các request
export const setupAxiosInterceptors = () => {
  api.interceptors.request.use(
    config => {
      const token = localStorage.getItem(AUTH_CONFIG.TOKEN_KEY);
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      return config;
    },
    error => {
      return Promise.reject(error);
    }
  );

  // Xử lý lỗi 401 Unauthorized - tự động đăng xuất khi token hết hạn
  api.interceptors.response.use(
    response => response,
    error => {
      if (error.response && error.response.status === 401) {
        logout();
        // Redirect to login page
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );
};

// Export instance axios để sử dụng ở các service khác
export const apiClient = api;