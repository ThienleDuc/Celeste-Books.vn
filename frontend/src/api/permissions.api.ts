// Nhớ import clearCache từ axios
import axiosClient, { clearCache } from "./axios";

/* ===================== TYPES ===================== */

export interface Permission {
  id: number;
  name: string;
  description: string | null;
  slug: string;
}

export interface PermissionListResponse {
  success: boolean;
  data: Permission[];
}

export interface PermissionDetailResponse {
  success: boolean;
  data: Permission;
}

export interface CreatePermissionPayload {
  name: string;
  description?: string;
  slug?: string;
}

export interface UpdatePermissionPayload {
  name: string;
  description?: string;
  slug?: string;
}

/* ===================== API ===================== */

export const permissionsApi = {
  /* ---------- GET LIST (CÓ CACHE) ---------- */
  getAll(keyword?: string) {
    return axiosClient.get<PermissionListResponse>("/permissions", {
      params: keyword ? { keyword } : undefined,
      cache: true, // Permissions ít thay đổi -> Cache rất hiệu quả
    });
  },

  /* ---------- GET BY SLUG (CÓ CACHE) ---------- */
  getBySlug(slug: string) {
    return axiosClient.get<PermissionDetailResponse>(`/permissions/${slug}`, {
      cache: true,
    });
  },

  /* ---------- CREATE (XÓA CACHE) ---------- */
  create(data: CreatePermissionPayload) {
    // Tạo quyền mới -> Danh sách cũ sai -> Xóa cache
    clearCache("/permissions");
    return axiosClient.post("/permissions", data);
  },

  /* ---------- UPDATE (XÓA CACHE) ---------- */
  update(id: number | string, data: UpdatePermissionPayload) {
    // Sửa quyền -> Cache cũ sai -> Xóa cache
    clearCache("/permissions");
    return axiosClient.put(`/permissions/${id}`, data);
  },

  /* ---------- DELETE (XÓA CACHE) ---------- */
  delete(id: number | string) {
    // Xóa quyền -> Cache cũ sai -> Xóa cache
    clearCache("/permissions");
    return axiosClient.delete(`/permissions/${id}`);
  },
};

export default permissionsApi;