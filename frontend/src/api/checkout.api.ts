import axiosClient from "./axios";

// 1. Định nghĩa kiểu cho sản phẩm trong giỏ hàng (Frontend/State)
export interface CheckoutProduct {
  id: number;
  productId: number;
  product_detail_id: number; // Tên trường từ API JSON bạn cung cấp
  productType: string;
  quantity: number;
  priceAtTime: number;
  name?: string;
  image?: string;
}

// 2. Định nghĩa kiểu cho dữ liệu lưu trữ
export interface LocalStorageCartData {
  userId: string;
  products: CheckoutProduct[];
  totalPrice: number;
  totalQuantity: number;
  timestamp: string;
}

// 3. Định nghĩa kiểu cho Request gửi lên Laravel Backend
export interface CreateOrderItem {
  product_id: number;
  product_details_id: number; // Backend yêu cầu tên này (có chữ s)
  quantity: number;
  product_type: string;
  price: number;
}

export interface CreateOrderRequest {
  user_id: string;
  shipping_address_id: number;
  payment_method: string;
  shipping_type: string;
  product_discount_id?: number;
  shipping_discount_id?: number;
  items: CreateOrderItem[];
}

// 4. Các hàm API
export const checkoutApi = {
  getOrderById: (orderId: number) => axiosClient.get(`/orders/${orderId}`),
  getUserAddresses: (userId: string) => {
    return axiosClient.get(`/addresses/user/${userId}`);
  },
  getProductsDetails: (productIds: number[]) => {
    return axiosClient.get(`/products`, { params: { ids: productIds } });
  },
  calculateOrder: (data: any) => {
    return axiosClient.post(`/orders/calculate`, data);
  },
  createOrder: (orderData: CreateOrderRequest) => {
    return axiosClient.post(`/orders/create`, orderData);
  },
  getUserCart: (userId: string) => {
    return axiosClient.get(`/cart/user/${userId}`);
  },
  createVnpayUrl: (paymentData: { order_id: number | string; amount: number }) => {
    return axiosClient.post(`/vnpay/create-payment`, paymentData);
  },
  verifyVnpayPayment: (vnpayParams: any) => {
    return axiosClient.get(`/vnpay/return`, { params: vnpayParams });
  },
};