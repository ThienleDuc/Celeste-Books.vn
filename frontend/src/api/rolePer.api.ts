import axiosClient, { clearCache } from "./axios";

/* ===================== TYPES (Giữ nguyên) ===================== */

export interface RolePermission {
  role_id: string;
  role_name: string;
  per_id: number;
  permission_name: string;
  permission_slug: string;
}

export interface RolePermissionListResponse {
  success: boolean;
  data: RolePermission[];
}

export interface SimplePermission {
  id: number;
  name: string;
  slug: string;
  description: string | null;
}

export interface SimpleRole {
  id: string;
  name: string;
  slug: string;
}

/* ---------- FILTER ---------- */
export interface RolePermissionFilter {
  role_id?: string;
  per_id?: number;
  role_name?: string;
  per_name?: string;
}

/* ---------- CREATE ---------- */
export interface AssignPermissionPayload {
  role_id: string;
  per_id: number;
}

/* ---------- UPDATE ---------- */
export interface UpdateRolePermissionPayload {
  role_id: string;
  per_id: number;
  new_per_id: number;
}

/* ---------- DELETE ---------- */
export interface RemovePermissionPayload {
  role_id: string;
  per_id: number;
}

/* ===================== API ===================== */

export const rolePersApi = {
  /* ---------- GET LIST + FILTER (CÓ CACHE) ---------- */
  getAll(params?: RolePermissionFilter) {
    return axiosClient.get<RolePermissionListResponse>(
      "/role-permissions",
      { 
        params,
        cache: true // Cache danh sách phân quyền
      }
    );
  },

  /* ---------- ASSIGN PERMISSION (XÓA CACHE) ---------- */
  assign(data: AssignPermissionPayload) {
    // Gán quyền mới -> Dữ liệu cũ sai -> Xóa cache
    clearCache("/role-permissions");
    return axiosClient.post("/role-permissions", data);
  },

  /* ---------- UPDATE PERMISSION (XÓA CACHE) ---------- */
  update(data: UpdateRolePermissionPayload) {
    // Sửa quyền -> Dữ liệu cũ sai -> Xóa cache
    clearCache("/role-permissions");
    return axiosClient.put("/role-permissions", data);
  },

  /* ---------- REMOVE PERMISSION (XÓA CACHE) ---------- */
  remove(data: RemovePermissionPayload) {
    // Gỡ quyền -> Dữ liệu cũ sai -> Xóa cache
    clearCache("/role-permissions");
    return axiosClient.delete("/role-permissions", {
      data,
    });
  },

  /* ---------- GET PERMISSIONS BY ROLE (CÓ CACHE) ---------- */
  getByRole(roleId: string) {
    // API này thường được gọi để check quyền User -> Cần Cache để load nhanh
    return axiosClient.get<{
      success: boolean;
      data: SimplePermission[];
    }>(`/role-permissions/role/${roleId}`, {
      cache: true
    });
  },

  /* ---------- GET ROLES BY PERMISSION (CÓ CACHE) ---------- */
  getByPermission(perId: number | string) {
    return axiosClient.get<{
      success: boolean;
      data: SimpleRole[];
    }>(`/role-permissions/permission/${perId}`, {
      cache: true
    });
  },
};

export default rolePersApi;