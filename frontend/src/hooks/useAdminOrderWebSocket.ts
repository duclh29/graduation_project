import { useEffect, useState } from "react";
import { Client } from "@stomp/stompjs";
import { toast } from "react-toastify";
import type { AdminOrderEvent } from "../types/admin";
import { useAuth } from "./useAuth";

const buildToastMessage = (evt: AdminOrderEvent) => {
  const orderLabel = evt.orderCode || `#${evt.orderId}`;
  switch (evt.eventType) {
    case "ORDER_CREATED":
      return { type: "info" as const, message: `Đơn mới ${orderLabel} từ ${evt.customerName || "khách hàng"}` };
    case "ORDER_RETURN_REQUESTED":
      return { type: "warn" as const, message: `Đơn ${orderLabel} đang chờ duyệt trả hàng` };
    case "ADMIN_RETURN_APPROVED":
      return { type: "success" as const, message: `Đã duyệt trả hàng cho đơn ${orderLabel}` };
    case "ADMIN_RETURN_REJECTED":
      return { type: "error" as const, message: `Đã từ chối yêu cầu trả hàng của đơn ${orderLabel}` };
    default:
      return { type: "success" as const, message: evt.message || `Đơn ${orderLabel} đã được cập nhật` };
  }
};

export const useAdminOrderWebSocket = () => {
  const { user, isAuthenticated } = useAuth();
  const [lastEvent, setLastEvent] = useState<AdminOrderEvent | null>(null);

  useEffect(() => {
    const hasAccess = user?.roles?.some(r => ["ROLE_ADMIN", "ADMIN", "ROLE_STAFF", "STAFF"].includes(r));
    if (!isAuthenticated || !hasAccess) return;

    let wsUrl = import.meta.env.VITE_WS_URL || "ws://localhost:8080/ws";
    // If backend uses .withSockJS(), native websockets must connect to /websocket path
    if (!wsUrl.endsWith("/websocket")) {
      wsUrl = wsUrl.endsWith("/") ? `${wsUrl}websocket` : `${wsUrl}/websocket`;
    }

    const client = new Client({
      brokerURL: wsUrl,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000
    });

    client.onConnect = () => {
      client.subscribe("/topic/admin/orders", (message) => {
        if (!message.body) return;
        const evt: AdminOrderEvent = JSON.parse(message.body);
        setLastEvent(evt);
        const toastPayload = buildToastMessage(evt);
        if (toastPayload.type === "info") toast.info(toastPayload.message);
        else if (toastPayload.type === "warn") toast.warn(toastPayload.message);
        else if (toastPayload.type === "error") toast.error(toastPayload.message);
        else toast.success(toastPayload.message);
      });
    };

    client.activate();
    return () => {
      client.deactivate();
    };
  }, [isAuthenticated, user]);

  return { lastEvent };
};
