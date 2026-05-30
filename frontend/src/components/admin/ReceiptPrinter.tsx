import React from "react";
import type { AdminPosOrderResponse } from "../../types/admin";

interface ReceiptPrinterProps {
  order: AdminPosOrderResponse | null;
}

const formatPrice = (value?: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value || 0);
const formatDate = (value?: string) => (value ? new Date(value).toLocaleString("vi-VN") : "-");

export const ReceiptPrinter: React.FC<ReceiptPrinterProps> = ({ order }) => {
  if (!order) return null;

  return (
    <div className="hidden print:block text-black bg-white w-full max-w-[80mm] mx-auto p-4 text-[12px] leading-tight font-sans">
      <div className="text-center mb-4">
        <h2 className="text-lg font-bold uppercase mb-1">Cửa hàng Giày Sneaker</h2>
        <p>322 Mỹ Đình, Nam Từ Liêm, Hà Nội</p>
        <p>SĐT: 0868099315</p>
        <h3 className="text-xl font-bold uppercase mt-3 mb-1 border-y border-dashed border-black py-1">HÓA ĐƠN BÁN LẺ</h3>
      </div>

      <div className="mb-4">
        <div className="flex justify-between"><span>Mã ĐH:</span> <span className="font-semibold">{order.orderCode}</span></div>
        <div className="flex justify-between"><span>Ngày:</span> <span>{formatDate(order.createdAt)}</span></div>
        <div className="flex justify-between"><span>Khách hàng:</span> <span>{order.customerName || "Khách lẻ"}</span></div>
      </div>

      <table className="w-full mb-4">
        <thead>
          <tr className="border-y border-dashed border-black">
            <th className="py-1 text-left w-1/2">Sản phẩm</th>
            <th className="py-1 text-center w-1/6">SL</th>
            <th className="py-1 text-right w-1/3">Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          {order.items?.map((item) => (
            <tr key={item.orderItemId} className="border-b border-dashed border-black/30">
              <td className="py-2 pr-2">
                <div className="font-semibold">{item.productName}</div>
                <div className="text-[10px]">{item.color} - {item.size}</div>
              </td>
              <td className="py-2 text-center">{item.quantity}</td>
              <td className="py-2 text-right">{formatPrice(item.totalPrice)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="space-y-1 border-b border-dashed border-black pb-2 mb-2">
        <div className="flex justify-between"><span>Tổng cộng:</span> <span>{formatPrice(order.subtotalAmount)}</span></div>
        <div className="flex justify-between"><span>Giảm giá:</span> <span>- {formatPrice(order.discountAmount)}</span></div>
        <div className="flex justify-between text-sm font-bold mt-1"><span>THÀNH TIỀN:</span> <span>{formatPrice(order.finalPrice)}</span></div>
      </div>

      <div className="space-y-1 mb-4">
        <div className="flex justify-between"><span>Khách đưa:</span> <span>{formatPrice(order.cashReceived || order.finalPrice)}</span></div>
        <div className="flex justify-between"><span>Tiền thừa:</span> <span>{formatPrice(order.changeAmount || 0)}</span></div>
      </div>

      <div className="text-center italic mt-6 mb-2">
        <p>Cảm ơn quý khách và hẹn gặp lại!</p>
        <p className="text-[10px] mt-1">Hàng mua rồi có thể đổi trong 7 ngày nếu lỗi NSX.</p>
      </div>
    </div>
  );
};
