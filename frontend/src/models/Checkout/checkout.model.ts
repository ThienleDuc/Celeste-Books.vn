export interface CheckoutProduct {
  id: number;
  productId: number;
  quantity: number;
  priceAtTime: number;
  name: string;
  image: string;
  productType: string;
}

export interface LocalStorageCartData {
  userId: string;
  products: Array<{
    id: number;
    productId: number;
    quantity: number;
    priceAtTime: number;
    name: string;
    image: string;
    productType: string;
  }>;
  totalQuantity: number;
  totalPrice: number;
  timestamp: string;
}

export interface OrderItemInput {
  checkoutProduct: CheckoutProduct;
  orderId: number;
  productDetailsId: number;
}

