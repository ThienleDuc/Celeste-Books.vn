// ../Cart/cart.model.ts

import type { Product, ProductDetail } from "../Product/product.model";

/* =======================
   SHOPPING_CARTS TABLE
   ======================= */
// ⚠️ Lưu ý: "abanoned" giữ nguyên theo DB (sai chính tả)
export type ShoppingCartStatus =
  | "active"
  | "checked out"
  | "abanoned";

export interface ShoppingCart {
  id: number;              // BIGINT
  userId: string;          // VARCHAR(10)
  status: ShoppingCartStatus;
  createdAt: string;       // TIMESTAMP
  updatedAt: string;       // TIMESTAMP
}

/* =======================
   CART_ITEMS TABLE
   ======================= */
export interface CartItem {
  id: number;              // BIGINT
  cartId: number;          // BIGINT
  productId: number;
  productDetailtId: number;        // BIGINT
  quantity: number;         // INT
  priceAtTime: number;     // DECIMAL(12,2)
  createdAt: string;       // TIMESTAMP
  updatedAt: string;       // TIMESTAMP
  product?:   Product;
  product_detail?: ProductDetail;
}

/* =========================================================
   MOCK DATA
   ========================================================= */

export const sampleShoppingCarts: ShoppingCart[] = [
  {
    id: 1,
    userId: "U001",
    status: "active",
    createdAt: "2025-01-10T08:30:00",
    updatedAt: "2025-01-10T09:15:00",
  },
  {
    id: 2,
    userId: "U002",
    status: "checked out",
    createdAt: "2025-01-08T14:00:00",
    updatedAt: "2025-01-08T14:45:00",
  },
  {
    id: 3,
    userId: "U003",
    status: "abanoned",
    createdAt: "2025-01-05T19:20:00",
    updatedAt: "2025-01-05T19:40:00",
  },
];

export const sampleCartItems: CartItem[] = [
  {
    id: 1,
    cartId: 1,
    productId: 3,
    productDetailtId: 101, // thêm field này
    quantity: 1,
    priceAtTime: 120000,
    createdAt: "2025-01-10T08:31:00",
    updatedAt: "2025-01-10T08:31:00",
  },
  {
    id: 2,
    cartId: 1,
    productId: 7,
    productDetailtId: 102,
    quantity: 1,
    priceAtTime: 89000,
    createdAt: "2025-01-10T08:35:00",
    updatedAt: "2025-01-10T08:35:00",
  },
  {
    id: 3,
    cartId: 2,
    productId: 5,
    productDetailtId: 103,
    quantity: 1,
    priceAtTime: 150000,
    createdAt: "2025-01-08T14:05:00",
    updatedAt: "2025-01-08T14:05:00",
  },
  {
    id: 4,
    cartId: 3,
    productId: 9,
    productDetailtId: 104,
    quantity: 1,
    priceAtTime: 99000,
    createdAt: "2025-01-05T19:22:00",
    updatedAt: "2025-01-05T19:22:00",
  },
];
