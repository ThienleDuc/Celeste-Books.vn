// src/api/axios.ts
import axios, { 
  type AxiosResponse, 
  type InternalAxiosRequestConfig
} from "axios";

const axiosClient = axios.create({
  baseURL: "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 10000, // Timeout 10s
});

// --- REQUEST INTERCEPTOR ---
axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Attach Token
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// --- RESPONSE INTERCEPTOR ---
axiosClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    // Xử lý lỗi chung (VD: 401 Unauthorized)
    if (error.response?.status === 401) {
      // localStorage.removeItem("access_token");
      // window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Hàm clearCache vẫn giữ cho tương thích (không làm gì)
export const clearCache = () => {
  console.log('Cache disabled - clearCache does nothing');
};

export default axiosClient;