import axiosClient from './axios';

export interface PurchasedProduct {
  id: number;
  name: string;
  slug: string;
  image: string;
  author: string;
  price: number;
  original_price: number;
  discount_percent: number;
  last_purchased: string;
  total_purchased: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}

export const historyApi = {
  // Lấy danh sách sản phẩm đã mua của user
  getPurchasedProducts: (userId: string) => {
    return axiosClient.get<ApiResponse<PurchasedProduct[]>>(`/users/${userId}/purchased-products`);
  },
};