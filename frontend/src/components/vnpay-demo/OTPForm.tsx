import { useEffect, useState } from "react";

interface OTPFormProps {
  onSubmit: (otp: string) => Promise<void> | void;
  onResend: () => void;
  loading?: boolean;
}

const OTPForm = ({ onSubmit, onResend, loading = false }: OTPFormProps) => {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = window.setTimeout(() => setCountdown((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [countdown]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    const normalizedOtp = otp.trim();
    if (!/^\d{6}$/.test(normalizedOtp)) {
      setError("Mã OTP phải gồm 6 chữ số.");
      return;
    }

    await onSubmit(normalizedOtp);
  };

  const handleResend = () => {
    onResend();
    setOtp("");
    setError("");
    setCountdown(30);
  };

  return (
    <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-semibold text-[#0f4a8a]">Mã OTP</label>
        <input
          value={otp}
          onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
          placeholder="Nhập 6 chữ số"
          className="w-full rounded-lg border border-[#bfd4ea] px-4 py-3 text-center text-xl tracking-[0.4em] outline-none focus:border-[#0f70c0]"
        />
      </div>

      {error && <p className="text-sm font-medium text-red-600">{error}</p>}

      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-600">
          OTP hết hạn sau: <strong>{countdown}s</strong>
        </span>
        <button
          type="button"
          onClick={handleResend}
          disabled={countdown > 0}
          className="font-semibold text-[#0f70c0] disabled:text-slate-400"
        >
          Gửi lại OTP
        </button>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-[#0f70c0] px-4 py-3 text-base font-bold text-white transition hover:bg-[#0d5c9d] disabled:opacity-70"
      >
        {loading ? "Đang xác nhận..." : "Xác nhận"}
      </button>
    </form>
  );
};

export default OTPForm;

