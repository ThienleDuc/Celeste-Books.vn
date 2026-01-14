// src/api/categories.api.ts
// Nhớ import hàm clearCache từ file axios bạn vừa tạo
import axiosClient, { clearCache } from "./axios";

/* ===================== TYPES (Giữ nguyên như cũ) ===================== */
export interface Category {
  id: number;
  name: string | null;
  slug: string;
  created_at: string | null;
}

export interface CreateCategoryPayload {
  name?: string;
  slug?: string;
}

export interface UpdateCategoryPayload {
  name?: string;
  slug?: string;
}

export interface CategoryListParams {
  search?: string;
}

/* ===================== API ===================== */

const categoriesApi = {
  /* ---------- GET ALL (DÙNG CACHE) ---------- */
  getAll(params?: CategoryListParams) {
    return axiosClient.get("/categories", { 
      params,
      cache: true // <--- Bật cache: Lần đầu gọi API, lần sau lấy từ RAM (0ms)
    });
  },

  /* ---------- GET BY ID (DÙNG CACHE) ---------- */
  getById(id: number | string) {
    return axiosClient.get(`/categories/${id}`, { 
      cache: true // <--- Bật cache chi tiết
    });
  },

  /* ---------- CREATE (XÓA CACHE) ---------- */
  create(data: CreateCategoryPayload) {
    // Khi tạo mới, danh sách cũ không còn đúng nữa -> Xóa cache
    clearCache("/categories"); 
    return axiosClient.post("/categories", data);
  },

  /* ---------- UPDATE (XÓA CACHE) ---------- */
  update(id: number | string, data: UpdateCategoryPayload) {
    // Khi cập nhật, dữ liệu cũ sai -> Xóa cache
    clearCache("/categories");
    return axiosClient.put(`/categories/${id}`, data);
  },

  /* ---------- DELETE (XÓA CACHE) ---------- */
  delete(id: number | string) {
    // Khi xóa, danh sách cũ thừa -> Xóa cache
    clearCache("/categories");
    return axiosClient.delete(`/categories/${id}`);
  },
};

export default categoriesApi;