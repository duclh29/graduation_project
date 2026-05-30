import { ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import OTPForm from "../components/vnpay-demo/OTPForm";
import { useAuth } from "../hooks/useAuth";
import { useCart } from "../hooks/useCart";
import { paymentService } from "../services/paymentService";
import { vnpayDemoStorage } from "../services/vnpayDemoStorage";

const VnpayDemoOtpPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");
  const { user } = useAuth();
  const { fetchCart } = useCart();
  const cardData = vnpayDemoStorage.getCardData();

  if (!cardData) {
    return (
      <div className="min-h-screen bg-[#eef4fb] py-10">
        <div className="mx-auto max-w-xl px-4">
          <div className="rounded-2xl border border-[#d6e6f6] bg-white p-6 text-center shadow-sm">
            <p className="text-base text-slate-700">Phiên thanh toán không hợp lệ.</p>
            <Link to="/vnpay-demo/card" className="mt-4 inline-block rounded bg-[#0f70c0] px-4 py-2 text-white">
              Quay lại nhập thẻ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#eef4fb] py-10">
      <div className="mx-auto max-w-xl px-4">
        <div className="mb-4 rounded-2xl bg-[#0f70c0] p-5 text-white shadow-lg">
          <div className="flex items-center gap-3">
            <ShieldCheck size={28} />
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-white/80">VNPay Demo</p>
              <h1 className="text-3xl font-black">Xác thực OTP</h1>
            </div>
          </div>
        </div>

        <div className="mb-4 rounded-2xl border border-[#d6e6f6] bg-white p-4 text-sm text-slate-700 shadow-sm">
          <p>Thẻ: **** **** **** {cardData.cardNumber.slice(-4)}</p>
          <p>Chủ thẻ: {cardData.cardHolder}</p>
        </div>

        <div className="rounded-2xl border border-[#d6e6f6] bg-white p-6 shadow-sm">
          <OTPForm
            loading={loading}
            onResend={() => toast.info("Đã gửi lại OTP mới")}
            onSubmit={async (otp) => {
              setLoading(true);
              try {
                await new Promise((resolve) => setTimeout(resolve, 900));
                if (otp === "123456") {
                  if (orderId) {
                    try {
                      const paymentRes = await paymentService.createVnpayUrl({ orderId: orderId });
                      if (!paymentRes?.paymentUrl?.includes("/demo-pay") && paymentRes?.paymentUrl) {
                        window.location.href = paymentRes.paymentUrl;
                        return;
                      }
                    } catch (e) {
                      console.error("VNPAY initialization error:", e);
                    }
                    await paymentService.completeVnpayDemo(orderId);
                  }
                  if (user?.userId) {
                    await fetchCart(user.userId);
                  }
                  vnpayDemoStorage.clear();
                  navigate(`/orders/${orderId || ""}`, { replace: true });
                } else {
                  navigate(`/payment-result?paymentStatus=FAILED&message=Mã OTP không hợp lệ${orderId ? `&orderId=${orderId}` : ""}`);
                }
              } catch (error) {
                toast.error("Đã xảy ra lỗi khi xác thực thanh toán");
                navigate(`/payment-result?paymentStatus=FAILED&message=Lỗi hệ thống${orderId ? `&orderId=${orderId}` : ""}`);
              } finally {
                setLoading(false);
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default VnpayDemoOtpPage;
