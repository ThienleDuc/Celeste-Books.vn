import axiosClient from "./axios";

/* ===================== TYPES ===================== */

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
  /* ---------- GET LIST + FILTER ---------- */
  getAll(params?: RolePermissionFilter) {
    return axiosClient.get<RolePermissionListResponse>(
      "/role-permissions",
      { params }
    );
  },

  /* ---------- ASSIGN PERMISSION TO ROLE ---------- */
  assign(data: AssignPermissionPayload) {
    return axiosClient.post("/role-permissions", data);
  },

  /* ---------- UPDATE PERMISSION OF ROLE ---------- */
  update(data: UpdateRolePermissionPayload) {
    return axiosClient.put("/role-permissions", data);
  },

  /* ---------- REMOVE PERMISSION FROM ROLE ---------- */
  remove(data: RemovePermissionPayload) {
    return axiosClient.delete("/role-permissions", {
      data,
    });
  },

  /* ---------- GET PERMISSIONS BY ROLE ---------- */
  getByRole(roleId: string) {
    return axiosClient.get<{
      success: boolean;
      data: SimplePermission[];
    }>(`/role-permissions/role/${roleId}`);
  },

  /* ---------- GET ROLES BY PERMISSION ---------- */
  getByPermission(perId: number | string) {
    return axiosClient.get<{
      success: boolean;
      data: SimpleRole[];
    }>(`/role-permissions/permission/${perId}`);
  },
};

export default rolePersApi;
