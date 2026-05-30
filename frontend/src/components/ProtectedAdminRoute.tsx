import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import LoadingSpinner from "./LoadingSpinner";

const ProtectedAdminRoute = () => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  // Check if authenticated AND has ROLE_ADMIN
  if (!isAuthenticated || !user?.roles?.includes("ROLE_ADMIN")) {
    // Nếu không phải admin, đẩy về trang chủ hoặc báo lỗi không có quyền
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedAdminRoute;
