// src/api/user.address.api.ts
import axiosClient from "./axios";

/* ===================== INTERFACES ===================== */

/**
 * KHỚP bảng addresses + JOIN trong controller
 */
export interface UserAddress {
  id: number;
  user_id: string;

  label: string | null;
  receiver_name: string;
  phone: string;
  street_address: string;
  commune_id: number | null;
  is_default: boolean;

  created_at: string;
  updated_at?: string; // Có trong response update

  // Fields từ JOIN (không có trong DB)
  commune_name?: string | null;
  province_name?: string | null;
  full_address?: string;
}

/**
 * Payload tạo địa chỉ - KHỚP validation BE
 */
export interface CreateAddressPayload {
  label?: string | null;
  receiver_name: string;           // required
  phone: string;                  // required, digits:10
  street_address: string;         // required
  commune_id?: number | null;     // nullable
  is_default?: boolean;           // sometimes
}

/**
 * Payload cập nhật địa chỉ - KHỚP validation BE
 */
export interface UpdateAddressPayload {
  label?: string | null;
  receiver_name?: string;         // sometimes|required
  phone?: string;                 // sometimes|required, digits:10
  street_address?: string;        // sometimes|required
  commune_id?: number | null;     // sometimes|nullable
  is_default?: boolean;           // sometimes
}

/* ===================== RESPONSE ===================== */

// Base response interface - KHỚP response của BE
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;               // Có thể không có message trong getUserAddresses
  data?: T;
  errors?: Record<string, string[]>;
}

// Specific response types
export type AddressResponse = ApiResponse<UserAddress>;
export type AddressListResponse = ApiResponse<UserAddress[]>;
export type SimpleAddressResponse = ApiResponse<void | null>; // Chỉ success + message

/* ===================== API ===================== */

export const userAddressApi = {
  /**
   * GET /users/{userId}/addresses
   * KHỚP: public function getUserAddresses($userId)
   */
  getUserAddresses(userId: string) {
    return axiosClient.get<AddressListResponse>(
      `/admin/users/${userId}/addresses`
    );
  },

  /**
   * POST /users/{userId}/addresses
   * KHỚP: public function addAddress(Request $request, $userId)
   * Status: 201 Created
   */
  addAddress(userId: string, data: CreateAddressPayload) {
    return axiosClient.post<AddressResponse>(
      `/admin/users/${userId}/addresses`,
      data
    );
  },

  /**
   * PUT /users/{userId}/addresses/{addressId}
   * KHỚP: public function updateAddress(Request $request, $userId, $addressId)
   */
  updateAddress(
    userId: string,
    addressId: number,
    data: UpdateAddressPayload
  ) {
    return axiosClient.put<AddressResponse>(
      `/admin/users/${userId}/addresses/${addressId}`,
      data
    );
  },

  /**
   * DELETE /users/{userId}/addresses/{addressId}
   * KHỚP: public function deleteAddress($userId, $addressId)
   */
  deleteAddress(userId: string, addressId: number) {
    return axiosClient.delete<SimpleAddressResponse>(
      `/admin/users/${userId}/addresses/${addressId}`
    );
  },

  /**
   * PUT /users/{userId}/addresses/{addressId}/set-default
   * KHỚP: public function setDefaultAddress($userId, $addressId)
   */
  setDefaultAddress(userId: string, addressId: number) {
    return axiosClient.put<SimpleAddressResponse>(
      `/admin/users/${userId}/addresses/${addressId}/set-default`
    );
  },
};

export default userAddressApi;