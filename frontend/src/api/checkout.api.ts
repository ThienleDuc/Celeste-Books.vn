import axiosClient from "./axios";

export interface CheckoutProduct {
  id: number;
  productId: number;
  product_detail_id: number; 
  productType: string;
  quantity: number;
  priceAtTime: number;
  // Các trường bổ sung để hiển thị (Mapping từ Laravel)
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
  product_id: number;
  product_details_id: number; // Khớp với Controller Laravel
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
  shipping_fee: number; // Nên thêm vào request
  discount: number;     // Nên thêm vào request
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
  // Các API lấy thông tin đơn hàng và cấu hình
  getOrderById: (orderId: number) => axiosClient.get(`/orders/${orderId}`),
  getProductDiscounts: () => axiosClient.get('/order-product-discounts'),
  getShippingDiscounts: () => axiosClient.get('/order-shipping-discounts'),
  getShippingFeeDetails: () => axiosClient.get('/order-shipping-fee-details'),
  getUserAddresses: (userId: string) => axiosClient.get(`/addresses/user/${userId}`),

  // API Giỏ hàng & Thanh toán
  getUserCart: (userId: string) => axiosClient.get(`/cart/user/${userId}`),
  
  getLatestCartItem: (userId: string) => {
    return axiosClient.get<{ success: boolean; data: LatestCartItem | null }>(
      `/cart/latest/${userId}`
    );
  },

  createOrder: (orderData: CreateOrderRequest) => {
    return axiosClient.post(`/orders/create`, orderData);
  },

  // VNPAY
  createVnpayUrl: (paymentData: { order_id: number | string; amount: number }) => {
    return axiosClient.post(`/vnpay/create-payment`, paymentData);
  },
};