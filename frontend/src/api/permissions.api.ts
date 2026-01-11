import axiosClient from "./axios";

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
  /* ---------- GET LIST (optional search) ---------- */
  getAll(keyword?: string) {
    return axiosClient.get<PermissionListResponse>("/permissions", {
      params: keyword ? { keyword } : undefined,
    });
  },

  /* ---------- GET BY SLUG ---------- */
  getBySlug(slug: string) {
    return axiosClient.get<PermissionDetailResponse>(`/permissions/${slug}`);
  },

  /* ---------- CREATE ---------- */
  create(data: CreatePermissionPayload) {
    return axiosClient.post("/permissions", data);
  },

  /* ---------- UPDATE (by ID) ---------- */
  update(id: number | string, data: UpdatePermissionPayload) {
    return axiosClient.put(`/permissions/${id}`, data);
  },

  /* ---------- DELETE (by ID) ---------- */
  delete(id: number | string) {
    return axiosClient.delete(`/permissions/${id}`);
  },
};

export default permissionsApi;
