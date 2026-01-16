// src/api/users.api.ts
import axios from "axios";
import type { UserMe } from "./auth.api";
import axiosClient from "./axios";

/* ===================== TYPES ===================== */

export interface User {
  id: string;
  username: string | null;
  email: string | null;
  is_active: boolean;
  role_id: string;
  created_at: string | null;
}

export interface UserWithRelations {
  id: string;
  username: string | null;
  email: string | null;
  is_active: boolean;
  role_id: string;
  created_at: string | null;
  
  status_text: string;
  role_name: string | null;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  gender: string | null;
  birthday: string | null;
  created_at_raw: string | null;
  gender_text: string;
  
  role?: {
    id: string;
    name: string;
  } | null;
  profile?: {
    full_name: string | null;
    avatar_url: string | null;
    phone: string | null;
    birthday: string | null;
    gender: string | null;
  } | null;
}

// Thêm interface cho Address chi tiết
export interface UserAddress {
  id: number;
  user_id: string;
  label: string | null;
  receiver_name: string;
  phone: string;
  street_address: string;
  commune_id: number;
  is_default: boolean;
  created_at: string;
  commune_name: string | null;
  commune_code: string | null;
  province_name: string | null;
  province_code: string | null;
  full_address: string;
}

// Thêm interface cho Notification
export interface UserNotification {
  id: number;
  user_id: string;
  title: string;
  content: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export interface UserDetail extends UserWithRelations {
  addresses?: UserAddress[];
  notifications?: UserNotification[];
}

// ===================== PAYLOAD INTERFACES =====================

export interface CreateUserPayload {
  username: string;
  email: string;
  password: string;
  role_id: string | number;
  full_name?: string | null;
  phone?: string | null;
  birthday?: string | null;
  gender?: string | null;
  is_active?: boolean;
}

export interface UpdateUserPayload {
  username?: string;
  email?: string;
  password?: string;
  role_id?: string | number;
  full_name?: string | null;
  phone?: string | null;
  birthday?: string | null;
  gender?: string | null;
  is_active?: boolean;
}

// ===================== ADDRESS PAYLOAD INTERFACES =====================

export interface CreateAddressPayload {
  label?: string | null;
  receiver_name: string;
  phone: string;
  street_address: string;
  commune_id: number;
  is_default?: boolean;
}

export interface UpdateAddressPayload {
  label?: string | null;
  receiver_name?: string;
  phone?: string;
  street_address?: string;
  commune_id?: number;
  is_default?: boolean;
}

// ===================== PAGINATION INTERFACES =====================

export interface UserPaginationParams {
  page?: number;
  per_page?: number;
  sort_field?: string;
  sort_order?: 'asc' | 'desc';
  role_id?: string | number;
  is_active?: boolean | string | number;
  search?: string;
}

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
  has_more_pages: boolean;
  next_page_url: string | null;
  prev_page_url: string | null;
}

export interface PaginationData {
  items: UserWithRelations[];
  pagination: PaginationMeta;
  sort: {
    field: string;
    order: string;
  };
}

// ===================== RESPONSE INTERFACES =====================

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
  code?: number;
}

export interface UploadAvatarResponse {
  message: string;
  avatar_url: string;
}

// ===================== HELPER FUNCTIONS =====================

export const formatDateForAPI = (dateString?: string | null): string | undefined => {
  if (!dateString) return undefined;
  
  try {
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }
    
    const parts = dateString.split('/');
    if (parts.length === 3) {
      const [day, month, year] = parts;
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    
    return dateString;
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

export const prepareCreateUserPayload = (data: CreateUserPayload): CreateUserPayload => {
  const payload: CreateUserPayload = {
    username: data.username.trim(),
    email: data.email.trim(),
    password: data.password,
    role_id: data.role_id,
    is_active: data.is_active ?? true,
  };
  
  if (data.full_name && data.full_name.trim() !== '') {
    payload.full_name = data.full_name.trim();
  }
  
  if (data.phone && data.phone.trim() !== '') {
    payload.phone = data.phone.trim();
  }
  
  if (data.birthday && data.birthday.trim() !== '') {
    payload.birthday = formatDateForAPI(data.birthday) ?? undefined;
  }
  
  if (data.gender && data.gender.trim() !== '') {
    payload.gender = data.gender.trim();
  }
  
  return payload;
};

export const prepareUpdateUserPayload = (data: UpdateUserPayload): UpdateUserPayload => {
  const payload: UpdateUserPayload = {};
  
  if (data.username !== undefined) payload.username = data.username.trim();
  if (data.email !== undefined) payload.email = data.email.trim();
  if (data.password !== undefined) payload.password = data.password;
  if (data.role_id !== undefined) payload.role_id = data.role_id;
  if (data.is_active !== undefined) payload.is_active = data.is_active;
  
  if (data.full_name !== undefined) {
    payload.full_name = data.full_name && data.full_name.trim() !== '' 
      ? data.full_name.trim() 
      : null;
  }
  
  if (data.phone !== undefined) {
    payload.phone = data.phone && data.phone.trim() !== '' 
      ? data.phone.trim() 
      : null;
  }
  
  if (data.birthday !== undefined) {
    payload.birthday = data.birthday && data.birthday.trim() !== ''
      ? formatDateForAPI(data.birthday) ?? null
      : null;
  }
  
  if (data.gender !== undefined) {
    payload.gender = data.gender && data.gender.trim() !== ''
      ? data.gender.trim()
      : null;
  }
  
  return payload;
};

/* ===================== USER API ===================== */

export const userApi = {
  /* ---------- CREATE USER ---------- */
  createUser(data: CreateUserPayload) {
    const payload = prepareCreateUserPayload(data);
    console.log('Create user payload:', payload);
    
    return axiosClient.post<ApiResponse<UserWithRelations>>('/admin/users', payload);
  },

  /* ---------- UPDATE USER ---------- */
  updateUser(id: string | number, data: UpdateUserPayload) {
    const payload = prepareUpdateUserPayload(data);
    console.log('Update user payload:', payload);
    
    return axiosClient.put<ApiResponse<UserWithRelations>>(`/admin/users/update/${id}`, payload);
  },

  /* ---------- GET ALL USERS WITH PAGINATION & FILTERS ---------- */
  getAllUsersWithPagination(params?: UserPaginationParams) {
    return axiosClient.get<ApiResponse<PaginationData>>('/admin/users/getAllUser', { 
      params: {
        ...params,
        ...(params?.is_active !== undefined && typeof params.is_active === 'boolean' 
          ? { is_active: params.is_active ? 1 : 0 } 
          : {})
      }
    });
  },

  /* ---------- GET USER DETAIL ---------- */
  getUserDetail(id: string | number) {
    return axiosClient.get<ApiResponse<UserDetail>>(`/admin/users/getUserById/${id}`);
  },

  /* ---------- GET USER ADDRESSES ---------- */
  getUserAddresses(userId: string | number) {
    return axiosClient.get<ApiResponse<UserAddress[]>>(`/admin/users/${userId}/addresses`);
  },

  /* ---------- UPLOAD AVATAR ---------- */
  uploadAvatar(id: string | number, avatarFile: File) {
    const formData = new FormData();
    formData.append('avatar', avatarFile);
    
    return axiosClient.post<ApiResponse<UploadAvatarResponse>>(
      `/admin/users/avatar-x/${id}`, 
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
  },

  /* ---------- TOGGLE USER STATUS ---------- */
  toggleStatus(id: string) {
    return axiosClient.put<ApiResponse<UserWithRelations>>(`/admin/users/toggle-status/${id}`);
  },

  /* ---------- DELETE USER ---------- */
  /* ---------- DELETE USER ---------- */
  deleteUser: async (targetUserId: string): Promise<ApiResponse> => {
    try {
      // 1. Lấy thông tin current user từ /auth/me
      let currentUserId: string;
      
      try {
        // Kiểm tra xem đã có token chưa
        const token = localStorage.getItem("access_token");
        if (!token) {
          throw new Error("Chưa đăng nhập. Vui lòng đăng nhập lại.");
        }

        // Gọi API để lấy thông tin user hiện tại
        const meResponse = await axiosClient.get<ApiResponse<UserMe>>("/auth/me");
        
        if (!meResponse.data.success || !meResponse.data.data) {
          throw new Error("Không thể lấy thông tin người dùng hiện tại");
        }
        
        currentUserId = meResponse.data.data.id;
      } catch (error) {
        console.error("Error getting current user:", error);
        throw new Error("Không thể xác định người dùng hiện tại. Vui lòng đăng nhập lại.");
      }

      // 2. Gọi API xóa user với current_user_id
      const response = await axiosClient.delete<ApiResponse>(
        `/admin/users/delete/${targetUserId}`,
        {
          params: {
            current_user_id: currentUserId
          }
        }
      );
      
      // 3. Xóa cache liên quan - NẾU clearCache không tồn tại, comment hoặc xóa
      // clearCache('/admin/users');
      // clearCache('/auth/me');
      
      return response.data;
    } catch (error: unknown) {
      console.error('Delete user error:', error);
      
      // Xử lý lỗi đặc biệt
      if (axios.isAxiosError(error)) {
        // Lỗi từ axios
        if (error.response?.status === 401) {
          // Token hết hạn hoặc không hợp lệ
          localStorage.removeItem("access_token");
          localStorage.removeItem("user_info");
          throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        }
        
        // Có response từ server với ApiResponse structure
        if (error.response?.data) {
          const apiError = error.response.data as ApiResponse;
          throw new Error(apiError.message || "Xóa người dùng thất bại");
        }
      }
      
      // Lỗi từ try-catch bên trong (lỗi khi gọi /auth/me)
      if (error instanceof Error) {
        throw error; // Giữ nguyên message đã tạo
      }
      
      // Lỗi không xác định
      throw new Error("Có lỗi xảy ra khi xóa người dùng");
    }
  },
};

export default userApi;