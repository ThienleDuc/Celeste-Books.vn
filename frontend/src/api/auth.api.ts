import axiosClient from "./axios";

export interface LoginPayload {
  username?: string;
  email?: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  password: string;
  password_confirmation: string;
  role_id: string;
  full_name: string;
}

export interface CheckExistsPayload {
  username?: string;
  email?: string;
  role_id?: string;
}

export interface SuggestRolePayload {
  username?: string;
  email?: string;
}

export interface UserRole {
  id: string;
  name: string;
}

export interface UserProfile {
  full_name: string | null;
  gender: "Nam" | "Nữ" | "Khác" | null;
  phone: string | null;
  avatar_url: string | null;
}

export interface UserToken {
  token_id: number;
  name: string;
  expires_at: string | null;
  is_expired: boolean;
  last_used_at: string | null;
}

export interface UserMe {
  id: string;
  username: string | null;
  email: string | null;
  role: UserRole;
  profile: UserProfile | null;
  status: "active" | "inactive";
  created_at: string | null;
  token_valid: boolean;
  token: UserToken | null;
}

export const authApi = {
  /* ---------- REGISTER ---------- */
  register(data: RegisterPayload) {
    return axiosClient.post("/auth/register", data);
  },

  /* ---------- LOGIN ---------- */
  login(data: LoginPayload) {
    return axiosClient.post("/auth/login", data);
  },

  /* ---------- CURRENT USER ---------- */
  me() {
    return axiosClient.get("/auth/me");
  },

  /* ---------- LOGOUT (current token) ---------- */
  logout() {
    return axiosClient.post("/auth/logout");
  },

  /* ---------- LOGOUT ALL DEVICES ---------- */
  logoutAll() {
    return axiosClient.post("/auth/logout-all");
  },

  /* ---------- LIST DEVICES ---------- */
  devices() {
    return axiosClient.get("/auth/devices");
  },

  /* ---------- REVOKE TOKEN ---------- */
  revokeToken(tokenId: number | string) {
    return axiosClient.delete(`/auth/tokens/${tokenId}`);
  },

  /* ---------- CHECK USERNAME / EMAIL EXISTS ---------- */
  checkExists(data: CheckExistsPayload) {
    return axiosClient.post("/auth/check-exists", data);
  },

  /* ---------- SUGGEST ROLE ---------- */
  suggestRole(data: SuggestRolePayload) {
    return axiosClient.post("/auth/suggest-role", data);
  },
};

export default authApi;
