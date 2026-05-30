import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";
import { toast } from "react-toastify";
import { cartService } from "../services/cartService";
import type { CartSummary } from "../types/cart";

interface CartContextValue {
  cart: CartSummary | null;
  loading: boolean;
  fetchCart: (userId: number, couponCode?: string) => Promise<void>;
  addToCart: (userId: number, variantId: number, quantity: number, couponCode?: string) => Promise<void>;
  updateQuantity: (userId: number, variantId: number, quantity: number, couponCode?: string) => Promise<void>;
  removeItem: (userId: number, variantId: number, couponCode?: string) => Promise<void>;
  clearCart: (userId: number) => Promise<void>;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);
const CART_CACHE_KEY = "cart_summary_cache";

const emptyCart: CartSummary = {
  items: [],
  subtotal: 0,
  promotionDiscount: 0,
  couponDiscount: 0,
  discountAmount: 0,
  finalPrice: 0
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartSummary | null>(() => {
    const cached = localStorage.getItem(CART_CACHE_KEY);
    if (!cached) {
      return emptyCart;
    }
    try {
      return JSON.parse(cached) as CartSummary;
    } catch {
      return emptyCart;
    }
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!cart) {
      localStorage.removeItem(CART_CACHE_KEY);
      return;
    }
    localStorage.setItem(CART_CACHE_KEY, JSON.stringify(cart));
  }, [cart]);

  const fetchCart = useCallback(async (userId: number, couponCode?: string) => {
    setLoading(true);
    try {
      const data = await cartService.get(userId, couponCode);
      setCart(data);
    } finally {
      setLoading(false);
    }
  }, []);

  const addToCart = useCallback(async (userId: number, variantId: number, quantity: number, couponCode?: string) => {
    setLoading(true);
    try {
      const data = await cartService.add({ userId, variantId, quantity, couponCode });
      setCart(data);
      toast.success("Thêm vào giỏ hàng thành công");
    } finally {
      setLoading(false);
    }
  }, []);

  const updateQuantity = useCallback(async (userId: number, variantId: number, quantity: number, couponCode?: string) => {
    setLoading(true);
    try {
      const data = await cartService.updateQuantity(userId, variantId, quantity, couponCode);
      setCart(data);
      toast.success("Cập nhật giỏ hàng thành công");
    } finally {
      setLoading(false);
    }
  }, []);

  const removeItem = useCallback(async (userId: number, variantId: number, couponCode?: string) => {
    setLoading(true);
    try {
      const data = await cartService.remove(userId, variantId, couponCode);
      setCart(data);
      toast.success("Đã xóa sản phẩm khỏi giỏ hàng");
    } finally {
      setLoading(false);
    }
  }, []);

  const clearCart = useCallback(async (userId: number) => {
    setLoading(true);
    try {
      await cartService.clear(userId);
      setCart(emptyCart);
      toast.success("Đã xóa toàn bộ giỏ hàng");
    } finally {
      setLoading(false);
    }
  }, []);

  const value = useMemo(
    () => ({
      cart,
      loading,
      fetchCart,
      addToCart,
      updateQuantity,
      removeItem,
      clearCart
    }),
    [cart, loading, fetchCart, addToCart, updateQuantity, removeItem, clearCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCartContext = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCartContext must be used within CartProvider");
  }
  return context;
};
