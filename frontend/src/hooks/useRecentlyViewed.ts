import { useState, useEffect } from "react";
import type { Product } from "../types/product";

const STORAGE_KEY = "shoe_store_recently_viewed";
const MAX_ITEMS = 10;

export const useRecentlyViewed = () => {
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setRecentlyViewed(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to parse recently viewed products", e);
    }
  }, []);

  const addRecentlyViewed = (product: Product) => {
    setRecentlyViewed((prev) => {
      // Bỏ qua nếu sản phẩm đã tồn tại (để đưa lên đầu)
      const filtered = prev.filter((p) => p.id !== product.id);
      const updated = [product, ...filtered].slice(0, MAX_ITEMS);
      
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error("Failed to save recently viewed product", e);
      }
      
      return updated;
    });
  };

  return { recentlyViewed, addRecentlyViewed };
};
