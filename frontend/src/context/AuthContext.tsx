import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { authService } from "../services/authService";
import { registerUnauthorizedHandler } from "../services/axios";
import { storage } from "../services/storage";
import type { LoginRequest, RegisterRequest, UserProfile } from "../types/auth";

interface AuthContextValue {
  user: UserProfile | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (payload: LoginRequest) => Promise<void>;
  register: (payload: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(storage.getUser());
  const [loading, setLoading] = useState(false);

  const clearSession = useCallback(() => {
    storage.clearAuth();
    setUser(null);
    navigate("/login");
  }, [navigate]);

  useEffect(() => {
    registerUnauthorizedHandler(clearSession);
  }, [clearSession]);

  const login = async (payload: LoginRequest) => {
    setLoading(true);
    try {
      const data = await authService.login(payload);
      storage.setAuth(data);
      setUser({ userId: data.userId, email: data.email, roles: data.roles });
      toast.success("Đăng nhập thành công");
      
      if (data.roles?.includes("ROLE_ADMIN")) {
        navigate("/admin/dashboard");
      } else {
        navigate("/");
      }
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message || "Đăng nhập thất bại"
        : "Đăng nhập thất bại";
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload: RegisterRequest) => {
    setLoading(true);
    try {
      await authService.register(payload);
      toast.success("Đăng ký thành công");
      navigate("/login");
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message || "Đăng ký thất bại"
        : "Đăng ký thất bại";
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    const refreshToken = storage.getRefreshToken();
    setLoading(true);
    try {
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
    } catch {
      toast.info("Đã đăng xuất trên trình duyệt");
    } finally {
      clearSession();
      setLoading(false);
    }
  };

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      loading,
      login,
      register,
      logout
    }),
    [loading, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return context;
};
