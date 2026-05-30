import { CheckCircle2, XCircle } from "lucide-react";
import { Link } from "react-router-dom";

interface ResultPageProps {
  success: boolean;
  message?: string;
  orderId?: string | null;
}

const ResultPage = ({ success, message, orderId }: ResultPageProps) => (
  <div className="rounded-2xl border border-[#d6e6f6] bg-white p-8 text-center shadow-sm">
    {success ? (
      <CheckCircle2 className="mx-auto text-green-600" size={64} />
    ) : (
      <XCircle className="mx-auto text-red-600" size={64} />
    )}
    <h2 className="mt-4 text-3xl font-black text-[#0f4a8a]">
      {success ? "Thanh toán thành công" : "Thanh toán thất bại"}
    </h2>
    <p className="mt-3 text-base text-slate-600">
      {message || (success ? "Giao dịch demo VNPay đã hoàn tất." : "Mã OTP không đúng, vui lòng thử lại.")}
    </p>
    <div className="mt-6 flex flex-wrap justify-center gap-3">
      <Link to="/" className="rounded-lg bg-[#0f70c0] px-5 py-3 text-sm font-bold text-white">
        Về trang chủ
      </Link>
      <Link to={orderId && success ? `/orders/${orderId}` : "/cart"} className="rounded-lg border border-[#0f70c0] px-5 py-3 text-sm font-bold text-[#0f70c0]">
        Xem hóa đơn
      </Link>
    </div>
  </div>
);

export default ResultPage;
