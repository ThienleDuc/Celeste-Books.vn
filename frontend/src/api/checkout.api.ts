import axiosClient from "./axios";

export interface CheckoutProduct {
  id: number;
  productId: number;
  product_detail_id: number; 
  productType: string;
  quantity: number;
  priceAtTime: number;
  name?: string;
  image?: string;
  price_at_time?: number | string;
  item_total?: number | string;
}

export interface LocalStorageCartData {
  userId: string;
  products: CheckoutProduct[];
  totalPrice: number;
  totalQuantity: number;
  timestamp: string;
  checkoutType: 'cart' | 'buy_now'; 
}

export interface CreateOrderItem {
  cart_item_id?: number; // Thêm trường này để controller xử lý xóa giỏ hàng sau khi đặt
  product_id: number;
  product_details_id: number; 
  quantity: number;
  product_type: string;
  price: number;
}

export interface CreateOrderRequest {
  user_id: string;
  shipping_address_id: number;
  payment_method: string;
  shipping_type: string;
  product_discount_id?: number | null;
  shipping_discount_id?: number | null;
  shipping_fee: number;
  discount: number;     
  total_amount: number;
  items: CreateOrderItem[];
}

export interface LatestCartItem {
  cart_item_id: number;
  product_id: number;
  product_detail_id: number;
  quantity: number;
  price_at_time: number | string;
  item_total: number | string;
  product_name: string;
  primary_image: string;
  product_type: string;
  author?: string;
  publisher?: string;
  stock_status?: string;
}

export const checkoutApi = {
  // --- QUẢN LÝ ĐỊA CHỈ (Dựa trên Laravel Routes bạn đã cung cấp) ---
  getUserAddresses: (userId: string) => 
    axiosClient.get(`/users/${userId}/addresses`),

  addAddress: (userId: string, data: any) => 
    axiosClient.post(`/users/${userId}/addresses`, data),

  updateAddress: (userId: string, addressId: number, data: any) => 
    axiosClient.put(`/users/${userId}/addresses/${addressId}`, data),

  deleteAddress: (userId: string, addressId: number) => 
    axiosClient.delete(`/users/${userId}/addresses/${addressId}`),

  setDefaultAddress: (userId: string, addressId: number) => 
    axiosClient.put(`/users/${userId}/addresses/${addressId}/set-default`),


  // --- CHIẾT KHẤU & PHÍ SHIP ---
  getProductDiscounts: () => axiosClient.get('/order-product-discounts'),
  getShippingDiscounts: () => axiosClient.get('/order-shipping-discounts'),
  getShippingFeeDetails: () => axiosClient.get('/order-shipping-fee-details'),


  // --- GIỎ HÀNG & SẢN PHẨM ---
  getUserCart: (userId: string) => axiosClient.get(`/cart/user/${userId}`),
  
  getLatestCartItem: (userId: string) => {
    return axiosClient.get<{ success: boolean; data: LatestCartItem | null }>(
      `/cart/latest/${userId}`
    );
  },

  // Phương thức lấy chi tiết nhiều sản phẩm cùng lúc
  getProductsDetails: (productIds: number[]) => {
    return axiosClient.get('/products/details', {
        params: { ids: productIds.join(',') }
    });
  },


  // --- ĐƠN HÀNG ---
  getOrderById: (orderId: number) => axiosClient.get(`/orders/${orderId}`),

  createOrder: (orderData: CreateOrderRequest) => {
    return axiosClient.post(`/orders/create`, orderData);
  },


  // --- THANH TOÁN VNPAY ---
  createVnpayUrl: (paymentData: { order_id: number | string; amount: number }) => {
    return axiosClient.post(`/vnpay/create-payment`, paymentData);
  },
};