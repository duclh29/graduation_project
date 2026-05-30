import { Navigate, Route, Routes } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./layouts/AuthLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./layouts/AdminLayout";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import FavoritePage from "./pages/FavoritePage";
import LoginPage from "./pages/LoginPage";
import ProductCatalogPage from "./pages/ProductCatalogPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import ProductListPage from "./pages/ProductListPage";
import OrderDetailsPage from "./pages/OrderDetailsPage";
import RegisterPage from "./pages/RegisterPage";
import PaymentResultPage from "./pages/PaymentResultPage";
import VnpayDemoCardPage from "./pages/VnpayDemoCardPage";
import VnpayDemoOtpPage from "./pages/VnpayDemoOtpPage";
import MyOrdersPage from "./pages/MyOrdersPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminOrdersPage from "./pages/admin/AdminOrdersPage";
import AdminProductsPage from "./pages/admin/AdminProductsPage";
import AdminPromotionsPage from "./pages/admin/AdminPromotionsPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminStaffsPage from "./pages/admin/AdminStaffsPage";
import AdminShiftsPage from "./pages/admin/AdminShiftsPage";
import AdminSchedulesPage from "./pages/admin/AdminSchedulesPage";
import AdminPosPage from "./pages/admin/AdminPosPage";
import AdminCouponsPage from "./pages/admin/AdminCouponsPage";
import AdminInvoicesPage from "./pages/admin/AdminInvoicesPage";
const App = () => (
  <Routes>
    {/* Auth pages – no header/footer */}
    <Route element={<AuthLayout />}>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
    </Route>

    {/* Main site */}
    <Route element={<MainLayout />}>
      <Route path="/" element={<ProductListPage />} />
      <Route path="/danh-muc" element={<ProductCatalogPage />} />
      <Route path="/yeu-thich" element={<FavoritePage />} />
      <Route path="/products/:id" element={<ProductDetailPage />} />
      <Route path="/payment-result" element={<PaymentResultPage />} />
      <Route path="/vnpay-demo/card" element={<VnpayDemoCardPage />} />
      <Route path="/vnpay-demo/otp" element={<VnpayDemoOtpPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/orders" element={<MyOrdersPage />} />
        <Route path="/orders/:id" element={<OrderDetailsPage />} />
      </Route>
    </Route>

    <Route path="/admin" element={<ProtectedAdminRoute />}>
      <Route element={<AdminLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="pos" element={<AdminPosPage />} />
        <Route path="products" element={<AdminProductsPage />} />
        <Route path="orders" element={<AdminOrdersPage />} />
        <Route path="invoices" element={<AdminInvoicesPage />} />
        <Route path="promotions" element={<AdminPromotionsPage />} />
        <Route path="coupons" element={<AdminCouponsPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="staffs" element={<AdminStaffsPage />} />
        <Route path="shifts" element={<AdminShiftsPage />} />
        <Route path="schedules" element={<AdminSchedulesPage />} />
      </Route>
    </Route>

    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default App;
