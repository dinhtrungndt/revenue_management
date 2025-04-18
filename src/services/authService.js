import axios from 'axios';

const API_URL = 'http://192.168.1.26:8080/api';

// Đăng ký tài khoản
export const register = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/auth/register`, userData);

    if (response.data && response.data.token) {
      // Lưu token vào localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));
    }

    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Lỗi kết nối server' };
  }
};

// Đăng nhập
export const login = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, { email, password });

    if (response.data && response.data.token) {
      // Lưu token vào localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));
    }

    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Lỗi kết nối server' };
  }
};

// Đăng xuất
export const logout = () => {
  // Xóa thông tin người dùng khỏi localStorage
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// Lấy thông tin người dùng hiện tại
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;

  return JSON.parse(userStr);
};

// Lấy thông tin từ API
export const getUserProfile = async () => {
  try {
    const token = localStorage.getItem('token');

    if (!token) {
      throw new Error('Không tìm thấy token xác thực');
    }

    const response = await axios.get(`${API_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Lỗi kết nối server' };
  }
};

// Thêm token xác thực vào header trong tất cả các request
export const setupAxiosInterceptors = () => {
  axios.interceptors.request.use(
    config => {
      const token = localStorage.getItem('token');
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
  axios.interceptors.response.use(
    response => response,
    error => {
      if (error.response && error.response.status === 401) {
        logout();
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );
};