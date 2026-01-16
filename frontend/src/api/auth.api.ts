import axiosClient, { clearCache } from "./axios";

/* ===================== TYPES ===================== */

export interface LoginPayload {
  username?: string;
  email?: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  password_confirmation: string;
  full_name: string;
  otp: string;
  role_id: string;
}

export interface SendOtpPayload {
  email: string;
}

export interface VerifyOtpPayload {
  email: string;
  otp: string;
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

/* ===================== RESPONSE TYPES ===================== */

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}

export interface SendOtpResponse {
  expires_at: string;
}

export interface RegisterResponse {
  user_id: string;
  username: string;
  email: string;
  role_id: string;
  full_name: string;
  gender: string;
  access_token: string;
  token_type: string;
  token_id: string | null;
  expires_at: string | null;
  expires_in_days: number | null;
}

export interface LoginResponse {
  user_id: string;
  username: string;
  email: string;
  role_id: string;
  has_profile: boolean;
  full_name: string | null;
  access_token: string;
  token_type: string;
  expires_at: string | null;
}

/* ===================== API ===================== */

export const authApi = {
  /* ---------- SEND OTP ---------- */
  sendOtp(data: SendOtpPayload) {
    return axiosClient.post<ApiResponse<SendOtpResponse>>("/auth/send-otp", data);
  },

  /* ---------- VERIFY OTP (OPTIONAL) ---------- */
  verifyOtp(data: VerifyOtpPayload) {
    return axiosClient.post<ApiResponse>("/auth/verify-otp", data);
  },

  /* ---------- REGISTER ---------- */
  register(data: RegisterPayload) {
    return axiosClient.post<ApiResponse<RegisterResponse>>("/auth/register", data);
  },

  /* ---------- LOGIN (XÓA CACHE CŨ) ---------- */
  login(data: LoginPayload) {
    clearCache(); 
    return axiosClient.post<ApiResponse<LoginResponse>>("/auth/login", data);
  },

  /* ---------- CURRENT USER (CÓ CACHE) ---------- */
  me() {
    return axiosClient.get<ApiResponse<UserMe>>("/auth/me");
  },

  /* ---------- LOGOUT (XÓA CACHE) ---------- */
  logout() {
    clearCache();
    return axiosClient.post<ApiResponse>("/auth/logout");
  },

  /* ---------- LOGOUT ALL DEVICES (XÓA CACHE) ---------- */
  logoutAll() {
    clearCache();
    return axiosClient.post<ApiResponse>("/auth/logout-all");
  },

  /* ---------- LIST DEVICES (KHÔNG CACHE) ---------- */
  devices() {
    return axiosClient.get<ApiResponse>("/auth/devices");
  },

  /* ---------- REVOKE TOKEN ---------- */
  revokeToken(tokenId: number | string) {
    return axiosClient.delete<ApiResponse>(`/auth/tokens/${tokenId}`);
  },

  /* ---------- CHECK USERNAME / EMAIL EXISTS ---------- */
  checkExists(data: CheckExistsPayload) {
    return axiosClient.post<ApiResponse>("/auth/check-exists", data);
  },

  /* ---------- SUGGEST ROLE ---------- */
  suggestRole(data: SuggestRolePayload) {
    return axiosClient.post<ApiResponse>("/auth/suggest-role", data);
  },
};

export default authApi;