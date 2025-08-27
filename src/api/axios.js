// api/axios.js
import axios from "axios";

const API_BASE_URL = "http://localhost:8081";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// إضافة التوكن تلقائياً للطلبات
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  config.headers["Content-Type"] = "application/json";
  return config;
});

// معالجة الأخطاء العامة
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

export default api;
