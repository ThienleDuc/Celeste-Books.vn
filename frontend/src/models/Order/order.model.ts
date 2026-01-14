/* =========================================================
   ORDERS + ORDER ITEMS MOCK DATA
   ========================================================= */

/* =======================
   ORDERS TABLE
   ======================= */
export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type PaymentMethod = "cod" | "momo" | "bank_transfer" | "credit_card";
export type PaymentStatus = "unpaid" | "paid" | "refunded";

export interface Order {
  id: number;
  user_id: string;
  order_code: string;
  status: OrderStatus;
  subtotal: number;
  shipping_fee: number;
  discount: number;
  total_amount: number;
  shipping_address_id: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  created_at: string;
  updated_at: string;
}

/* =======================
   ORDER ITEMS TABLE
   ======================= */
export type OrderProductType = "Sách giấy" | "Sách điện tử";

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product_details_id: number;
  product_type: OrderProductType;
  quantity: number;
  price: number;
  total_price: number;
  created_at: string;
}

/* =========================================================
   MOCK DATA - TẠO THỦ CÔNG ĐỂ DỄ TEST
   ========================================================= */

// 10 đơn hàng mẫu với các trạng thái khác nhau
export const orders: Order[] = [
  // Đơn hàng 1 - Đã giao, thanh toán qua momo
  {
    id: 1,
    user_id: "U001",
    order_code: "ORD-2025-001",
    status: "delivered",
    subtotal: 450000,
    shipping_fee: 30000,
    discount: 20000,
    total_amount: 460000,
    shipping_address_id: 1,
    payment_method: "momo",
    payment_status: "paid",
    created_at: "2025-01-10T09:30:00",
    updated_at: "2025-01-12T15:20:00"
  },
  // Đơn hàng 2 - Đang xử lý, thanh toán khi nhận hàng
  {
    id: 2,
    user_id: "U002",
    order_code: "ORD-2025-002",
    status: "processing",
    subtotal: 280000,
    shipping_fee: 25000,
    discount: 10000,
    total_amount: 295000,
    shipping_address_id: 2,
    payment_method: "cod",
    payment_status: "unpaid",
    created_at: "2025-01-12T14:45:00",
    updated_at: "2025-01-12T16:30:00"
  },
  // Đơn hàng 3 - Đã hủy
  {
    id: 3,
    user_id: "U001",
    order_code: "ORD-2025-003",
    status: "cancelled",
    subtotal: 120000,
    shipping_fee: 20000,
    discount: 0,
    total_amount: 140000,
    shipping_address_id: 3,
    payment_method: "bank_transfer",
    payment_status: "refunded",
    created_at: "2025-01-08T11:20:00",
    updated_at: "2025-01-09T10:15:00"
  },
  // Đơn hàng 4 - Đang chờ xác nhận
  {
    id: 4,
    user_id: "U003",
    order_code: "ORD-2025-004",
    status: "pending",
    subtotal: 650000,
    shipping_fee: 35000,
    discount: 50000,
    total_amount: 635000,
    shipping_address_id: 4,
    payment_method: "credit_card",
    payment_status: "paid",
    created_at: "2025-01-15T10:00:00",
    updated_at: "2025-01-15T10:00:00"
  },
  // Đơn hàng 5 - Đã vận chuyển
  {
    id: 5,
    user_id: "U002",
    order_code: "ORD-2025-005",
    status: "shipped",
    subtotal: 890000,
    shipping_fee: 40000,
    discount: 30000,
    total_amount: 900000,
    shipping_address_id: 5,
    payment_method: "momo",
    payment_status: "paid",
    created_at: "2025-01-11T16:30:00",
    updated_at: "2025-01-13T09:45:00"
  },
  // Đơn hàng 6 - Đã giao
  {
    id: 6,
    user_id: "U004",
    order_code: "ORD-2025-006",
    status: "delivered",
    subtotal: 320000,
    shipping_fee: 25000,
    discount: 15000,
    total_amount: 330000,
    shipping_address_id: 6,
    payment_method: "cod",
    payment_status: "paid",
    created_at: "2025-01-05T13:15:00",
    updated_at: "2025-01-08T11:30:00"
  },
  // Đơn hàng 7 - Đang xử lý
  {
    id: 7,
    user_id: "U005",
    order_code: "ORD-2025-007",
    status: "processing",
    subtotal: 540000,
    shipping_fee: 30000,
    discount: 20000,
    total_amount: 550000,
    shipping_address_id: 7,
    payment_method: "bank_transfer",
    payment_status: "unpaid",
    created_at: "2025-01-14T09:00:00",
    updated_at: "2025-01-14T11:45:00"
  },
  // Đơn hàng 8 - Đã giao
  {
    id: 8,
    user_id: "U001",
    order_code: "ORD-2025-008",
    status: "delivered",
    subtotal: 210000,
    shipping_fee: 20000,
    discount: 10000,
    total_amount: 220000,
    shipping_address_id: 8,
    payment_method: "momo",
    payment_status: "paid",
    created_at: "2025-01-03T15:40:00",
    updated_at: "2025-01-06T14:20:00"
  },
  // Đơn hàng 9 - Đang chờ xác nhận
  {
    id: 9,
    user_id: "U003",
    order_code: "ORD-2025-009",
    status: "pending",
    subtotal: 750000,
    shipping_fee: 35000,
    discount: 60000,
    total_amount: 725000,
    shipping_address_id: 9,
    payment_method: "credit_card",
    payment_status: "paid",
    created_at: "2025-01-16T11:30:00",
    updated_at: "2025-01-16T11:30:00"
  },
  // Đơn hàng 10 - Đã hủy
  {
    id: 10,
    user_id: "U002",
    order_code: "ORD-2025-010",
    status: "cancelled",
    subtotal: 180000,
    shipping_fee: 20000,
    discount: 0,
    total_amount: 200000,
    shipping_address_id: 10,
    payment_method: "cod",
    payment_status: "unpaid",
    created_at: "2025-01-09T14:20:00",
    updated_at: "2025-01-10T09:15:00"
  }
];

// Chi tiết đơn hàng cho 10 đơn hàng trên
export const orderItems: OrderItem[] = [
  // Order 1 - 2 sản phẩm
  {
    id: 1,
    order_id: 1,
    product_id: 101,
    product_details_id: 1,
    product_type: "Sách giấy",
    quantity: 2,
    price: 150000,
    total_price: 300000,
    created_at: "2025-01-10T09:30:00"
  },
  {
    id: 2,
    order_id: 1,
    product_id: 102,
    product_details_id: 2,
    product_type: "Sách điện tử",
    quantity: 1,
    price: 150000,
    total_price: 150000,
    created_at: "2025-01-10T09:30:00"
  },
  // Order 2 - 1 sản phẩm
  {
    id: 3,
    order_id: 2,
    product_id: 103,
    product_details_id: 3,
    product_type: "Sách giấy",
    quantity: 1,
    price: 280000,
    total_price: 280000,
    created_at: "2025-01-12T14:45:00"
  },
  // Order 3 - 1 sản phẩm
  {
    id: 4,
    order_id: 3,
    product_id: 104,
    product_details_id: 4,
    product_type: "Sách điện tử",
    quantity: 1,
    price: 120000,
    total_price: 120000,
    created_at: "2025-01-08T11:20:00"
  },
  // Order 4 - 3 sản phẩm
  {
    id: 5,
    order_id: 4,
    product_id: 105,
    product_details_id: 5,
    product_type: "Sách giấy",
    quantity: 1,
    price: 250000,
    total_price: 250000,
    created_at: "2025-01-15T10:00:00"
  },
  {
    id: 6,
    order_id: 4,
    product_id: 106,
    product_details_id: 6,
    product_type: "Sách giấy",
    quantity: 2,
    price: 200000,
    total_price: 400000,
    created_at: "2025-01-15T10:00:00"
  },
  // Order 5 - 2 sản phẩm
  {
    id: 7,
    order_id: 5,
    product_id: 107,
    product_details_id: 7,
    product_type: "Sách giấy",
    quantity: 1,
    price: 450000,
    total_price: 450000,
    created_at: "2025-01-11T16:30:00"
  },
  {
    id: 8,
    order_id: 5,
    product_id: 108,
    product_details_id: 8,
    product_type: "Sách điện tử",
    quantity: 2,
    price: 220000,
    total_price: 440000,
    created_at: "2025-01-11T16:30:00"
  },
  // Order 6 - 1 sản phẩm
  {
    id: 9,
    order_id: 6,
    product_id: 109,
    product_details_id: 9,
    product_type: "Sách giấy",
    quantity: 1,
    price: 320000,
    total_price: 320000,
    created_at: "2025-01-05T13:15:00"
  },
  // Order 7 - 2 sản phẩm
  {
    id: 10,
    order_id: 7,
    product_id: 110,
    product_details_id: 10,
    product_type: "Sách giấy",
    quantity: 2,
    price: 170000,
    total_price: 340000,
    created_at: "2025-01-14T09:00:00"
  },
  {
    id: 11,
    order_id: 7,
    product_id: 111,
    product_details_id: 11,
    product_type: "Sách điện tử",
    quantity: 1,
    price: 200000,
    total_price: 200000,
    created_at: "2025-01-14T09:00:00"
  },
  // Order 8 - 1 sản phẩm
  {
    id: 12,
    order_id: 8,
    product_id: 112,
    product_details_id: 12,
    product_type: "Sách điện tử",
    quantity: 1,
    price: 210000,
    total_price: 210000,
    created_at: "2025-01-03T15:40:00"
  },
  // Order 9 - 4 sản phẩm
  {
    id: 13,
    order_id: 9,
    product_id: 113,
    product_details_id: 13,
    product_type: "Sách giấy",
    quantity: 3,
    price: 150000,
    total_price: 450000,
    created_at: "2025-01-16T11:30:00"
  },
  {
    id: 14,
    order_id: 9,
    product_id: 114,
    product_details_id: 14,
    product_type: "Sách điện tử",
    quantity: 1,
    price: 300000,
    total_price: 300000,
    created_at: "2025-01-16T11:30:00"
  },
  // Order 10 - 1 sản phẩm
  {
    id: 15,
    order_id: 10,
    product_id: 115,
    product_details_id: 15,
    product_type: "Sách giấy",
    quantity: 1,
    price: 180000,
    total_price: 180000,
    created_at: "2025-01-09T14:20:00"
  }
];

/* =========================================================
   SOLD QUANTITY PER PRODUCT
   ========================================================= */

export interface ProductSold {
  product_id: number;
  total_sold: number;
}

/**
 * Tổng hợp số lượng đã bán của từng sản phẩm
 */
export const productSoldList: ProductSold[] = [
  { product_id: 101, total_sold: 2 },
  { product_id: 102, total_sold: 1 },
  { product_id: 103, total_sold: 1 },
  { product_id: 104, total_sold: 1 },
  { product_id: 105, total_sold: 1 },
  { product_id: 106, total_sold: 2 },
  { product_id: 107, total_sold: 1 },
  { product_id: 108, total_sold: 2 },
  { product_id: 109, total_sold: 1 },
  { product_id: 110, total_sold: 2 },
  { product_id: 111, total_sold: 1 },
  { product_id: 112, total_sold: 1 },
  { product_id: 113, total_sold: 3 },
  { product_id: 114, total_sold: 1 },
  { product_id: 115, total_sold: 1 }
];

/**
 * Map tiện tra nhanh: product_id -> total_sold
 */
export const productSoldMap: Record<number, number> = {
  101: 2,
  102: 1,
  103: 1,
  104: 1,
  105: 1,
  106: 2,
  107: 1,
  108: 2,
  109: 1,
  110: 2,
  111: 1,
  112: 1,
  113: 3,
  114: 1,
  115: 1
};

/* =========================================================
   HELPER FUNCTIONS
   ========================================================= */

/**
 * Find orders by user_id
 */
export function getOrdersByUserId(userId: string): Order[] {
  return orders.filter(order => order.user_id === userId);
}

/**
 * Find order items by order_id
 */
export function getOrderItemsByOrderId(orderId: number): OrderItem[] {
  return orderItems.filter(item => item.order_id === orderId);
}

/**
 * Get total revenue (sum of total_amount for delivered orders)
 */
export function getTotalRevenue(): number {
  return orders
    .filter(order => order.status === "delivered")
    .reduce((sum, order) => sum + order.total_amount, 0);
}

/**
 * Get order summary statistics
 */
export function getOrderStatistics() {
  const totalOrders = orders.length;
  const deliveredOrders = orders.filter(o => o.status === "delivered").length;
  const pendingOrders = orders.filter(o => o.status === "pending").length;
  const processingOrders = orders.filter(o => o.status === "processing").length;
  const cancelledOrders = orders.filter(o => o.status === "cancelled").length;
  const totalRevenue = getTotalRevenue();

  return {
    totalOrders,
    deliveredOrders,
    pendingOrders,
    processingOrders,
    cancelledOrders,
    totalRevenue
  };
}

/**
 * Get orders by date range
 */
export function getOrdersByDateRange(startDate: string, endDate: string): Order[] {
  return orders.filter(order => {
    const orderDate = new Date(order.created_at);
    return orderDate >= new Date(startDate) && orderDate <= new Date(endDate);
  });
}