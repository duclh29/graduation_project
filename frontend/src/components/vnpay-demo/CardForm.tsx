import { useMemo, useState } from "react";

export interface CardFormValues {
  cardNumber: string;
  cardHolder: string;
  expiryDate: string;
}

interface CardFormProps {
  onSubmit: (values: CardFormValues) => Promise<void> | void;
  loading?: boolean;
}

const digitsOnly = (value: string) => value.replace(/\D/g, "");

const CardForm = ({ onSubmit, loading = false }: CardFormProps) => {
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [error, setError] = useState("");

  const formattedCardNumber = useMemo(
    () => digitsOnly(cardNumber).replace(/(\d{4})(?=\d)/g, "$1 ").trim(),
    [cardNumber]
  );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    const normalizedCard = digitsOnly(cardNumber);
    const normalizedExpiry = expiryDate.trim();
    const normalizedHolder = cardHolder.trim();

    if (!normalizedCard || !normalizedHolder || !normalizedExpiry) {
      setError("Vui lòng nhập đầy đủ thông tin thẻ.");
      return;
    }

    if (!/^\d{16,19}$/.test(normalizedCard)) {
      setError("Số thẻ không hợp lệ (16-19 chữ số).");
      return;
    }

    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(normalizedExpiry)) {
      setError("Ngày hết hạn không hợp lệ. Định dạng MM/YY.");
      return;
    }

    await onSubmit({
      cardNumber: normalizedCard,
      cardHolder: normalizedHolder,
      expiryDate: normalizedExpiry
    });
  };

  return (
    <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-semibold text-[#0f4a8a]">Số thẻ</label>
        <input
          value={formattedCardNumber}
          onChange={(event) => setCardNumber(event.target.value)}
          placeholder="9704 1985 2619 1432"
          className="w-full rounded-lg border border-[#bfd4ea] px-4 py-3 text-base outline-none focus:border-[#0f70c0]"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-semibold text-[#0f4a8a]">Tên chủ thẻ</label>
        <input
          value={cardHolder}
          onChange={(event) => setCardHolder(event.target.value)}
          placeholder="NGUYEN VAN A"
          className="w-full rounded-lg border border-[#bfd4ea] px-4 py-3 text-base outline-none focus:border-[#0f70c0]"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-semibold text-[#0f4a8a]">Ngày hết hạn</label>
        <input
          value={expiryDate}
          onChange={(event) => setExpiryDate(event.target.value)}
          placeholder="MM/YY"
          className="w-full rounded-lg border border-[#bfd4ea] px-4 py-3 text-base outline-none focus:border-[#0f70c0]"
        />
      </div>

      {error && <p className="text-sm font-medium text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-[#0f70c0] px-4 py-3 text-base font-bold text-white transition hover:bg-[#0d5c9d] disabled:opacity-70"
      >
        {loading ? "Đang xử lý..." : "Thanh toán"}
      </button>
    </form>
  );
};

export default CardForm;

