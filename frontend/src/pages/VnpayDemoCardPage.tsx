import { CreditCard } from "lucide-react";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import CardForm from "../components/vnpay-demo/CardForm";
import { vnpayDemoStorage } from "../services/vnpayDemoStorage";

const VnpayDemoCardPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");

  return (
    <div className="min-h-screen bg-[#eef4fb] py-10">
      <div className="mx-auto max-w-xl px-4">
        <div className="mb-4 rounded-2xl bg-[#0f70c0] p-5 text-white shadow-lg">
          <div className="flex items-center gap-3">
            <CreditCard size={28} />
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-white/80">VNPay</p>
              <h1 className="text-3xl font-black">Thanh toán thẻ ngân hàng</h1>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[#d6e6f6] bg-white p-6 shadow-sm">
          <CardForm
            loading={loading}
            onSubmit={async (values) => {
              setLoading(true);
              await new Promise((resolve) => setTimeout(resolve, 900));
              vnpayDemoStorage.setCardData(values);
              navigate(`/vnpay-demo/otp${orderId ? `?orderId=${orderId}` : ""}`);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default VnpayDemoCardPage;
