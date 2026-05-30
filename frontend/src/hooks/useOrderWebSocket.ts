import { useEffect, useState } from 'react';
import { Client } from '@stomp/stompjs';
import { useAuth } from './useAuth';

export interface OrderUpdateEvent {
  orderId: number | string;
  orderCode?: string;
  status: string;
  paymentStatus: string;
  message?: string;
  eventType?: string;
}

export const useOrderWebSocket = (orderId?: number | string) => {
  const { user, isAuthenticated } = useAuth();
  const [lastEvent, setLastEvent] = useState<OrderUpdateEvent | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !user?.userId) return;

    let wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8080/ws';
    // If backend uses .withSockJS(), native websockets must connect to /websocket path
    if (!wsUrl.endsWith('/websocket')) {
      wsUrl = wsUrl.endsWith('/') ? `${wsUrl}websocket` : `${wsUrl}/websocket`;
    }

    const client = new Client({
      brokerURL: wsUrl,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: () => {}
    });

    client.onConnect = () => {
      client.subscribe(`/topic/orders/user/${user.userId}`, (message) => {
        if (message.body) {
          const evt: OrderUpdateEvent = JSON.parse(message.body);
          setLastEvent(evt);
        }
      });

      if (orderId) {
        client.subscribe(`/topic/orders/${orderId}`, (message) => {
          if (message.body) {
            const evt: OrderUpdateEvent = JSON.parse(message.body);
            setLastEvent(evt);
          }
        });
      }
    };

    client.activate();

    return () => {
      client.deactivate();
    };
  }, [isAuthenticated, user, orderId]);

  return { lastEvent };
};
