// src/api/axios.ts
import axios, { 
  type AxiosResponse, 
  type InternalAxiosRequestConfig, 
  type AxiosRequestConfig 
} from "axios";

// 1. Cấu hình Cache
const memoryCache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // Thời gian sống của cache: 5 phút

// Mở rộng type để TypeScript không báo lỗi thuộc tính 'cache'
declare module 'axios' {
  export interface AxiosRequestConfig {
    cache?: boolean; // Tùy chọn bật/tắt cache cho từng request
  }
}

const axiosClient = axios.create({
  baseURL: "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 10000, // Timeout 10s
});

// --- HELPER: Tạo key duy nhất cho mỗi request ---
const generateCacheKey = (config: AxiosRequestConfig) => {
  return `${config.method}:${config.url}?${JSON.stringify(config.params)}`;
};

// --- REQUEST INTERCEPTOR ---
axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 1. Attach Token
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 2. Logic Cache
    // Chỉ cache method GET và khi config.cache = true
    if (config.method === "get" && config.cache) {
      const key = generateCacheKey(config);
      const cachedRecord = memoryCache.get(key);

      // Nếu có cache và chưa hết hạn
      if (cachedRecord && Date.now() - cachedRecord.timestamp < CACHE_TTL) {
        // console.log(`[Cache Hit] ${config.url}`); // Bỏ comment để debug
        
        // Quan trọng: Sử dụng adapter để trả về dữ liệu giả lập, KHÔNG gọi network
        config.adapter = () => {
          return Promise.resolve({
            data: cachedRecord.data,
            status: 200,
            statusText: "OK",
            headers: {},
            config,
            request: {},
          });
        };
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// --- RESPONSE INTERCEPTOR ---
axiosClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Lưu vào Cache nếu request này yêu cầu cache
    if (response.config.method === "get" && response.config.cache) {
      const key = generateCacheKey(response.config);
      memoryCache.set(key, {
        data: response.data,
        timestamp: Date.now(),
      });
    }

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

/**
 * Hàm tiện ích để xóa cache thủ công (Dùng khi Create/Update/Delete)
 * @param urlEndpoint Endpoint cần xóa cache (ví dụ: '/categories')
 */
export const clearCache = (urlEndpoint?: string) => {
  if (urlEndpoint) {
    // Xóa các key có chứa endpoint này
    for (const key of memoryCache.keys()) {
      if (key.includes(urlEndpoint)) {
        memoryCache.delete(key);
      }
    }
  } else {
    // Xóa toàn bộ
    memoryCache.clear();
  }
};

export default axiosClient;

