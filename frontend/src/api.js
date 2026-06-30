import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

// Attach token
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('jkn21_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// Handle 401
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('jkn21_token');
      localStorage.removeItem('jkn21_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
