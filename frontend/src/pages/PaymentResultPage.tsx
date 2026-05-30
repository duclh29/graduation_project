import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../hooks/useAuth";
import { useCart } from "../hooks/useCart";

const PaymentResultPage = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { fetchCart } = useCart();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("Đang kiểm tra kết quả thanh toán...");

  const paymentStatusParam = params.get("paymentStatus");
  const orderStatusParam = params.get("orderStatus");
  const orderId = params.get("orderId");

  const isSuccess = useMemo(
    () => paymentStatusParam === "PAID" || orderStatusParam === "CONFIRMED",
    [paymentStatusParam, orderStatusParam]
  );

  useEffect(() => {
    const run = async () => {
      try {
        if (isSuccess) {
          if (user?.userId) {
            await fetchCart(user.userId);
          }
          if (orderId) {
            navigate(`/orders/${orderId}`, { replace: true });
            return;
          }
          setMessage("Thanh toán VNPay thành công");
          toast.success("Thanh toán thành công");
        } else {
          setMessage(params.get("message") || "Thanh toán không thành công. Đơn hàng của bạn đã được ghi nhận và giữ sản phẩm trong 15 phút. Vui lòng thực hiện thanh toán lại!");
          toast.error("Thanh toán không thành công");
        }
      } finally {
        setLoading(false);
      }
    };

    void run();
  }, [fetchCart, isSuccess, params, user?.userId, orderId]);

  return (
    <div className="min-h-[60vh] bg-[#f5f5f5] py-10">
      <div className="mx-auto max-w-2xl rounded bg-white p-8 shadow-sm">
        <h1 className="mb-4 text-2xl font-semibold text-slate-800">Kết quả thanh toán</h1>
        <p className="mb-6 text-sm text-slate-600">{loading ? "Đang xử lý..." : message}</p>

        <div className="flex flex-wrap gap-3">
          {isSuccess && orderId && (
            <Link to={`/orders/${orderId}`} className="rounded bg-[#E32A15] px-4 py-2 text-sm font-semibold text-white">
              Xem hóa đơn chi tiết
            </Link>
          )}
          {!isSuccess && orderId && (
            <Link to={`/orders/${orderId}`} className="rounded bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-2 text-sm font-semibold text-white shadow-md hover:from-emerald-600 hover:to-teal-700 transition">
              Thử lại thanh toán ngay
            </Link>
          )}
          <Link to="/" className={`rounded px-4 py-2 text-sm font-semibold ${isSuccess ? "border border-slate-300 text-slate-700" : "bg-slate-100 hover:bg-slate-200 text-slate-700"}`}>
            Về trang chủ
          </Link>
          <Link to="/cart" className="rounded border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">
            Về giỏ hàng
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentResultPage;
