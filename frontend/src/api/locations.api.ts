// src/api/locations.api.ts
import axiosClient from "./axios";

/* ===================== TYPES ===================== */

export interface Province {
  id: number;
  name: string;
  code: string;
}

export interface Commune {
  id: number;
  province_id: number;
  name: string;
  code: string;
  created_at?: string;
  updated_at?: string;
}

// Interface cho Commune Detail (có thêm province_name từ ProvinceController)
export interface CommuneDetail {
  province_id: number;
  province_name: string;
  province_code: string;
  commune_id: number;
  commune_name: string;
  commune_code: string;
}

// Cấu trúc pagination từ Laravel
export interface PaginationResponse<T> {
  data: T[];
  pagination?: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

// Response structure từ Laravel controller
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
}

// Type cho response từ province và commune APIs
export type ProvinceResponse = ApiResponse<PaginationResponse<Province>>;
export type CommuneResponse = ApiResponse<PaginationResponse<Commune>>;
export type CommuneDetailResponse = ApiResponse<CommuneDetail>;
export type ProvinceByCommuneResponse = ApiResponse<CommuneDetail>;

export interface LocationSearchParams {
  search?: string;
  page?: number;
  per_page?: number;
}

/* ===================== LOCATION API ===================== */

export const locationApi = {
  /* ---------- GET ALL PROVINCES ---------- */
  /**
   * GET /provinces
   * Khớp: Route::get('/', [ProvinceController::class, 'getAllProvinces']);
   */
  getAllProvinces(params?: LocationSearchParams) {
    return axiosClient.get<ProvinceResponse>('/provinces', { params });
  },

  /* ---------- GET COMMUNES BY PROVINCE ---------- */
  /**
   * GET /communes/{provinceId}
   * Khớp: Route::get('/{provinceId}', [CommuneController::class, 'getCommunesByProvince']);
   */
  getCommunesByProvince(provinceId: number, params?: LocationSearchParams) {
    return axiosClient.get<CommuneResponse>(`/communes/${provinceId}`, { params });
  },

  /* ---------- GET COMMUNE DETAIL ---------- */
  /**
   * GET /communes/detail/{id}
   * Khớp: Route::get('/detail/{id}', [CommuneController::class, 'getCommuneDetail']);
   */
  getCommuneDetail(id: number) {
    return axiosClient.get<CommuneDetailResponse>(`/communes/detail/${id}`);
  },

  /* ---------- GET PROVINCE BY COMMUNE ID ---------- */
  /**
   * GET /provinces/by-commune/{communeId}
   * Khớp: Route::get('/by-commune/{communeId}', [ProvinceController::class, 'getProvinceByCommuneId']);
   * Trả về: { province_id, province_name, province_code, commune_id, commune_name, commune_code }
   */
  getProvinceByCommuneId(communeId: number) {
    return axiosClient.get<ProvinceByCommuneResponse>(`/provinces/by-commune/${communeId}`);
  },

  /* ---------- UTILITY FUNCTIONS ---------- */
  
  // Hàm helper để lấy data từ province response
  extractProvinces(response: { data: ProvinceResponse }): Province[] {
    if (!response?.data?.success || !response.data.data?.data) {
      return [];
    }
    return response.data.data.data;
  },

  // Hàm helper để lấy data từ commune response
  extractCommunes(response: { data: CommuneResponse }): Commune[] {
    if (!response?.data?.success || !response.data.data?.data) {
      return [];
    }
    return response.data.data.data;
  },

  // Hàm helper để lấy commune detail data
  extractCommuneDetail(response: { data: CommuneDetailResponse }): CommuneDetail | null {
    if (!response?.data?.success || !response.data.data) {
      return null;
    }
    return response.data.data;
  },

  // Hàm helper để lấy province by commune data
  extractProvinceByCommune(response: { data: ProvinceByCommuneResponse }): CommuneDetail | null {
    if (!response?.data?.success || !response.data.data) {
      return null;
    }
    return response.data.data;
  },
  
  // Hàm helper để lấy thông tin pagination
  extractPagination<T>(response: { data: ApiResponse<PaginationResponse<T>> }) {
    if (!response?.data?.success || !response.data.data?.pagination) {
      return null;
    }
    return response.data.data.pagination;
  },
  
  // Hàm để lấy message từ response
  extractMessage(response: { data: ApiResponse<unknown> }): string {
    if (!response?.data) {
      return 'Không có phản hồi từ server';
    }
    return response.data.message || '';
  },
  
  // Kiểm tra response có thành công không
  isSuccess(response: { data: ApiResponse<unknown> }): boolean {
    return response?.data?.success === true;
  },

  // Format commune name để hiển thị
  formatCommuneDisplay(commune: CommuneDetail | null): string {
    if (!commune) return '';
    
    if (commune.commune_name && commune.province_name) {
      return `${commune.commune_name}, ${commune.province_name}`;
    } else if (commune.commune_name) {
      return commune.commune_name;
    }
    
    return '';
  },

  // Tạo full address từ commune detail và street address
  createFullAddress(streetAddress: string, communeDetail: CommuneDetail | null): string {
    if (!communeDetail) return streetAddress;
    
    const parts = [
      streetAddress,
      communeDetail.commune_name,
      communeDetail.province_name
    ];
    
    return parts.filter(part => part && part.trim() !== '').join(', ');
  },

  // Chuyển đổi CommuneDetail sang format chung
  convertToCommune(communeDetail: CommuneDetail): Commune {
    return {
      id: communeDetail.commune_id,
      province_id: communeDetail.province_id,
      name: communeDetail.commune_name,
      code: communeDetail.commune_code
    };
  },

  // Chuyển đổi Commune sang CommuneDetail (cần fetch thêm thông tin province)
  async convertToCommuneDetail(commune: Commune): Promise<CommuneDetail | null> {
    try {
      const response = await this.getCommuneDetail(commune.id);
      return this.extractCommuneDetail(response);
    } catch {
      return null;
    }
  },

  // Load province từ commune id (dùng cho AddressModal khi có commune_id cũ)
  async loadProvinceFromCommuneId(communeId: number | null): Promise<number | null> {
    if (!communeId) return null;
    
    try {
      const response = await this.getProvinceByCommuneId(communeId);
      const data = this.extractProvinceByCommune(response);
      return data ? data.province_id : null;
    } catch {
      return null;
    }
  }
};

export default locationApi;