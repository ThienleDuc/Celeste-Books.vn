import axiosClient from "./axios";

/* ===================== TYPES ===================== */

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
  /* ---------- GET LIST (optional search) ---------- */
  getAll(keyword?: string) {
    return axiosClient.get<RoleListResponse>("/roles", {
      params: keyword ? { keyword } : undefined,
    });
  },

  /* ---------- GET BY SLUG ---------- */
  getBySlug(slug: string) {
    return axiosClient.get<RoleDetailResponse>(`/roles/${slug}`);
  },

  /* ---------- CREATE ---------- */
  create(data: CreateRolePayload) {
    return axiosClient.post("/roles", data);
  },

  /* ---------- UPDATE (by ID) ---------- */
  update(id: string, data: UpdateRolePayload) {
    return axiosClient.put(`/roles/${id}`, data);
  },

  /* ---------- DELETE (by ID) ---------- */
  delete(id: string) {
    return axiosClient.delete(`/roles/${id}`);
  },
};

export default rolesApi;