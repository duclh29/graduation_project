import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";
import { toast } from "react-toastify";
import type { Product } from "../types/product";

interface FavoriteContextValue {
  favorites: Product[];
  favoriteIds: number[];
  isFavorite: (productId: number) => boolean;
  toggleFavorite: (product: Product) => void;
  removeFavorite: (productId: number) => void;
}

const FAVORITE_STORAGE_KEY = "favoriteProducts";
const FavoriteContext = createContext<FavoriteContextValue | undefined>(undefined);

export const FavoriteProvider = ({ children }: { children: ReactNode }) => {
  const [favorites, setFavorites] = useState<Product[]>([]);

  useEffect(() => {
    const raw = localStorage.getItem(FAVORITE_STORAGE_KEY);
    if (raw) {
      setFavorites(JSON.parse(raw) as Product[]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(FAVORITE_STORAGE_KEY, JSON.stringify(favorites));
  }, [favorites]);

  const isFavorite = (productId: number) => favorites.some((product) => product.id === productId);

  const toggleFavorite = (product: Product) => {
    setFavorites((previous) => {
      const exists = previous.some((item) => item.id === product.id);
      if (exists) {
        toast.info("Đã xóa khỏi yêu thích");
        return previous.filter((item) => item.id !== product.id);
      }
      toast.success("Đã thêm vào yêu thích");
      return [product, ...previous];
    });
  };

  const removeFavorite = (productId: number) => {
    setFavorites((previous) => previous.filter((item) => item.id !== productId));
    toast.info("Đã xóa khỏi yêu thích");
  };

  const value = useMemo(
    () => ({
      favorites,
      favoriteIds: favorites.map((product) => product.id),
      isFavorite,
      toggleFavorite,
      removeFavorite
    }),
    [favorites]
  );

  return <FavoriteContext.Provider value={value}>{children}</FavoriteContext.Provider>;
};

export const useFavoriteContext = () => {
  const context = useContext(FavoriteContext);
  if (!context) {
    throw new Error("useFavoriteContext must be used within FavoriteProvider");
  }
  return context;
};
