// ./Checkout/discount.model.ts

/* =======================
   WEIGHT FEE MODEL (bảng weight_fees)
   ======================= */
export interface WeightFee {
  id: number;                  // BIGINT AUTO_INCREMENT PRIMARY KEY
  min_weight: number;          // min_weight DECIMAL(10,2) NOT NULL
  max_weight: number;          // max_weight DECIMAL(10,2) NOT NULL
  multiplier: number;          // multiplier DECIMAL(5,2) NOT NULL
  created_at: string;          // created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
}

/* =======================
   DISTANCE FEE MODEL (bảng distance_fees)
   ======================= */
export interface DistanceFee {
  id: number;                  // BIGINT AUTO_INCREMENT PRIMARY KEY
  min_distance: number;        // min_distance DECIMAL(10,2) NOT NULL
  max_distance: number;        // max_distance DECIMAL(10,2) NOT NULL
  multiplier: number;          // multiplier DECIMAL(5,2) NOT NULL
  created_at: string;          // created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
}

/* =======================
   SHIPPING TYPE FEE MODEL (bảng shipping_type_fees)
   ======================= */
export type ShippingType = 'standard' | 'express';

export interface ShippingTypeFee {
  id: number;                  // BIGINT AUTO_INCREMENT PRIMARY KEY
  shipping_type: ShippingType; // shipping_type ENUM('standard', 'express', 'cod') NOT NULL
  multiplier: number;          // multiplier DECIMAL(5,2) NOT NULL
  created_at: string;          // created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
}

/* =======================
   ORDER SHIPPING FEE DETAIL MODEL (bảng order_shipping_fee_details)
   ======================= */
export interface OrderShippingFeeDetail {
  id: number;                  // BIGINT AUTO_INCREMENT PRIMARY KEY
  order_id: number;            // order_id BIGINT NOT NULL
  weight_fee_id: number;       // weight_fee_id BIGINT NOT NULL
  distance_fee_id: number;     // distance_fee_id BIGINT NOT NULL
  shipping_type_fee_id: number;// shipping_type_fee_id BIGINT NOT NULL
  amount: number;              // amount DECIMAL(12,2) NOT NULL
}

/* =======================
   ORDER PRODUCT DISCOUNT MODEL (bảng order_product_discounts)
   ======================= */
export type DiscountType = 'promo_code' | 'member_discount' | 'voucher';

export interface OrderProductDiscount {
  id: number;                  // BIGINT AUTO_INCREMENT PRIMARY KEY
  type: DiscountType;          // type ENUM('promo_code', 'member_discount', 'voucher') DEFAULT 'promo_code'
  amount: number;              // amount DECIMAL(12,2) NOT NULL
  created_at: string;          // created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
}

/* =======================
   ORDER SHIPPING DISCOUNT MODEL (bảng order_shipping_discounts)
   ======================= */
export interface OrderShippingDiscount {
  id: number;                  // BIGINT AUTO_INCREMENT PRIMARY KEY
  type: DiscountType;          // type ENUM('promo_code', 'member_discount', 'voucher') DEFAULT 'promo_code'
  amount: number;              // amount DECIMAL(12,2) NOT NULL
  created_at: string;          // created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
}

/* =======================
   ORDER DISCOUNT DETAIL MODEL (bảng order_discount_details)
   ======================= */
export interface OrderDiscountDetail {
  id: number;                  // BIGINT AUTO_INCREMENT PRIMARY KEY
  order_id: number;            // order_id BIGINT NOT NULL
  product_discount_id: number | null;  // product_discount_id BIGINT NULL
  shipping_discount_id: number | null; // shipping_discount_id BIGINT NULL
  amount: number;              // amount DECIMAL(12,2) NOT NULL
}

/* =======================
   SAMPLE DATA
   ======================= */

export const sampleWeightFees: WeightFee[] = [
  {
    id: 1,
    min_weight: 0,
    max_weight: 1,
    multiplier: 1.0,
    created_at: "2025-01-01T00:00:00"
  },
  {
    id: 2,
    min_weight: 1,
    max_weight: 3,
    multiplier: 1.5,
    created_at: "2025-01-01T00:00:00"
  },
  {
    id: 3,
    min_weight: 3,
    max_weight: 5,
    multiplier: 2.0,
    created_at: "2025-01-01T00:00:00"
  },
  {
    id: 4,
    min_weight: 5,
    max_weight: 10,
    multiplier: 3.0,
    created_at: "2025-01-01T00:00:00"
  },
];

export const sampleDistanceFees: DistanceFee[] = [
  {
    id: 1,
    min_distance: 0,
    max_distance: 10,
    multiplier: 1.0,
    created_at: "2025-01-01T00:00:00"
  },
  {
    id: 2,
    min_distance: 10,
    max_distance: 30,
    multiplier: 1.2,
    created_at: "2025-01-01T00:00:00"
  },
  {
    id: 3,
    min_distance: 30,
    max_distance: 50,
    multiplier: 1.5,
    created_at: "2025-01-01T00:00:00"
  },
  {
    id: 4,
    min_distance: 50,
    max_distance: 100,
    multiplier: 2.0,
    created_at: "2025-01-01T00:00:00"
  },
];

export const sampleShippingTypeFees: ShippingTypeFee[] = [
  {
    id: 1,
    shipping_type: 'standard',
    multiplier: 1.0,
    created_at: "2025-01-01T00:00:00"
  },
  {
    id: 2,
    shipping_type: 'express',
    multiplier: 1.5,
    created_at: "2025-01-01T00:00:00"
  }
];

export const sampleOrderProductDiscounts: OrderProductDiscount[] = [
  {
    id: 1,
    type: 'promo_code',
    amount: 20000,
    created_at: "2025-01-01T00:00:00"
  },
  {
    id: 2,
    type: 'member_discount',
    amount: 50000,
    created_at: "2025-01-01T00:00:00"
  },
  {
    id: 3,
    type: 'voucher',
    amount: 100000,
    created_at: "2025-01-01T00:00:00"
  },
];

export const sampleOrderShippingDiscounts: OrderShippingDiscount[] = [
  {
    id: 1,
    type: 'promo_code',
    amount: 15000,
    created_at: "2025-01-01T00:00:00"
  },
  {
    id: 2,
    type: 'member_discount',
    amount: 20000,
    created_at: "2025-01-01T00:00:00"
  },
  {
    id: 3,
    type: 'voucher',
    amount: 30000,
    created_at: "2025-01-01T00:00:00"
  },
];

export const sampleOrderDiscountDetails: OrderDiscountDetail[] = [
  {
    id: 1,
    order_id: 1001,
    product_discount_id: 1,
    shipping_discount_id: null,
    amount: 20000
  },
  {
    id: 2,
    order_id: 1002,
    product_discount_id: null,
    shipping_discount_id: 1,
    amount: 15000
  },
  {
    id: 3,
    order_id: 1003,
    product_discount_id: 2,
    shipping_discount_id: 2,
    amount: 70000
  },
];