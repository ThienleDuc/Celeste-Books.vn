// Import clearCache từ axios
import axiosClient, { clearCache } from "./axios";

/* ===================== TYPES (Giữ nguyên) ===================== */

export interface Role {
  id: string;
  name: string;
  description: string | null;
  slug: string;
}

export interface RoleListResponse {
  success: boolean;
  data: Role[];
}

export interface RoleDetailResponse {
  success: boolean;
  data: Role;
}

export interface CreateRolePayload {
  name: string;
  description?: string;
  slug?: string;
}

export interface UpdateRolePayload {
  name: string;
  description?: string;
  slug?: string;
}

/* ===================== API ===================== */

export const rolesApi = {
  /* ---------- GET LIST (CÓ CACHE) ---------- */
  getAll(keyword?: string) {
    return axiosClient.get<RoleListResponse>("/roles", {
      params: keyword ? { keyword } : undefined,
      cache: true, // Danh sách Role ít thay đổi -> Cache để load nhanh
    });
  },

  /* ---------- GET BY SLUG (CÓ CACHE) ---------- */
  getBySlug(slug: string) {
    return axiosClient.get<RoleDetailResponse>(`/roles/${slug}`, {
      cache: true,
    });
  },

  /* ---------- CREATE (XÓA CACHE) ---------- */
  create(data: CreateRolePayload) {
    // Tạo Role mới -> Danh sách cũ trong cache bị thiếu -> Xóa cache
    clearCache("/roles");
    return axiosClient.post("/roles", data);
  },

  /* ---------- UPDATE (XÓA CACHE) ---------- */
  update(id: string, data: UpdateRolePayload) {
    // Sửa Role -> Cache cũ sai thông tin -> Xóa cache
    clearCache("/roles");
    return axiosClient.put(`/roles/${id}`, data);
  },

  /* ---------- DELETE (XÓA CACHE) ---------- */
  delete(id: string) {
    // Xóa Role -> Cache cũ thừa thông tin -> Xóa cache
    clearCache("/roles");
    return axiosClient.delete(`/roles/${id}`);
  },
};

export default rolesApi;