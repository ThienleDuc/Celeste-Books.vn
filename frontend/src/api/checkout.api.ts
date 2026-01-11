import axiosClient from "./axios";

export const checkoutApi = {
  // Lấy danh sách địa chỉ của người dùng
  getUserAddresses: (userId: string) => {
    return axiosClient.get(`/addresses/user/${userId}`);
  },
    // Lấy chi tiết sản phẩm dựa trên danh sách ID sản phẩm
  getProductsDetails: (productIds: number[]) => {
    return axiosClient.get(`/products`, { params: { ids: productIds } });
  },

  // Tính toán phí ship và giảm giá từ backend (nếu có API)
  calculateOrder: (data: any) => {
    return axiosClient.post(`/orders/calculate`, data);
  },

  // Gửi đơn hàng lên server
  createOrder: (orderData: any) => {
    return axiosClient.post(`/orders/create`, orderData);
  },

  // Lấy giỏ hàng thực tế của user từ DB (Dựa trên route bạn đã cung cấp)
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