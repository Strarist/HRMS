import axios from 'axios';
import config from '../config/api.config';

const api = axios.create({
  baseURL: config.apiBaseUrl,
  timeout: config.apiTimeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Normalize URL: if baseURL already ends with /api, strip leading /api from url
    if (config.url && config.url.startsWith('/api/')) {
      config.url = config.url.replace(/^\/api/, '');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const isLoginRequest = error.config?.url?.includes('/auth/login') || 
                          error.config?.url?.includes('/auth/google');
    const isPasswordUpdate = error.config?.url?.includes('/auth/updatepassword');

    if (
      error.response?.status === 403 &&
      error.response?.data?.code === 'PASSWORD_CHANGE_REQUIRED' &&
      !isPasswordUpdate &&
      !window.location.pathname.includes('/change-password')
    ) {
      window.location.href = '/change-password';
      return Promise.reject(error);
    }
    
    // Handle authentication errors (401 Unauthorized) - but NOT for login requests
    if (error.response?.status === 401 && !isLoginRequest) {
      console.warn('⚠️ 401 Unauthorized - redirecting to login');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      return Promise.reject(error);
    }
    
    // For login requests, just pass the error through without redirecting
    if (isLoginRequest) {
      console.log('🔐 Login request failed - not redirecting, letting component handle it');
    }
    
    return Promise.reject(error);
  }
);

export default api;
