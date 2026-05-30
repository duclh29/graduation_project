export interface CartItem {
  variantId: number;
  productId: number;
  productName: string;
  sku?: string;
  size?: string;
  quantity: number;
  price: number;
  baseUnitPrice?: number;
  finalUnitPrice?: number;
  lineTotal?: number;
  lineDiscount?: number;
  imageUrl?: string;
  brand?: string;
  stockQuantity?: number;
}

export interface CartSummary {
  cartId?: number;
  userId?: number;
  couponCode?: string | null;
  items: CartItem[];
  subtotal: number;
  promotionDiscount: number;
  couponDiscount: number;
  discountAmount: number;
  finalPrice: number;
}

export interface AddToCartRequest {
  userId: number;
  variantId: number;
  quantity: number;
  couponCode?: string;
}
