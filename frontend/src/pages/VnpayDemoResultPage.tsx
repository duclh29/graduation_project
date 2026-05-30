import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import ResultPage from "../components/vnpay-demo/ResultPage";
import { useAuth } from "../hooks/useAuth";
import { useCart } from "../hooks/useCart";
import { paymentService } from "../services/paymentService";
import { vnpayDemoStorage } from "../services/vnpayDemoStorage";

const VnpayDemoResultPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const success = searchParams.get("status") === "success";
  const orderId = searchParams.get("orderId");
  const { user } = useAuth();
  const { fetchCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(success && !!orderId);

  useEffect(() => {
    vnpayDemoStorage.clear();
    
    if (success && orderId) {
      const processPayment = async () => {
        try {
          await paymentService.completeVnpayDemo(orderId);
          if (user?.userId) {
            await fetchCart(user.userId);
          }
          navigate(`/orders/${orderId}`, { replace: true });
        } catch (error) {
          console.error("Failed to complete demo payment", error);
          setIsProcessing(false);
        }
      };
      
      void processPayment();
    }
  }, [success, orderId, user?.userId, fetchCart]);

  return (
    <div className="min-h-screen bg-[#eef4fb] py-10">
      <div className="mx-auto max-w-xl px-4">
        {isProcessing ? (
          <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-[#d6e6f6] bg-white p-8 text-center shadow-sm">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#0f70c0] border-t-transparent"></div>
            <p className="mt-4 font-semibold text-[#0f4a8a]">Đang hoàn tất thanh toán...</p>
          </div>
        ) : (
          <ResultPage success={success} orderId={orderId} />
        )}
      </div>
    </div>
  );
};

export default VnpayDemoResultPage;
