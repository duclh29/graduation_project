package com.example.graduationproject.service;

import com.example.graduationproject.entity.Order;
import com.example.graduationproject.service.dto.OrderUpdateEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

@Service
@RequiredArgsConstructor
@Slf4j
public class WebSocketNotificationService {

    private final SimpMessagingTemplate messagingTemplate;

    public void notifyOrderStatusUpdate(Order order, String message) {
        notifyOrderStatusUpdate(order, message, "ORDER_UPDATED");
    }

    public void notifyOrderStatusUpdate(Order order, String message, String eventType) {
        if (order == null || order.getUser() == null || order.getId() == null) {
            return;
        }

        OrderUpdateEvent event = buildEvent(order, message, eventType);
        Runnable publisher = () -> publishEvent(order, event);

        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    publisher.run();
                }
            });
            return;
        }

        publisher.run();
    }

    private void publishEvent(Order order, OrderUpdateEvent event) {
        String destinationId = "/topic/orders/user/" + order.getUser().getId();
        log.info("Pushing WebSocket event to {}: {}", destinationId, event);
        messagingTemplate.convertAndSend(destinationId, event);

        String orderDestination = "/topic/orders/" + order.getId();
        messagingTemplate.convertAndSend(orderDestination, event);
        messagingTemplate.convertAndSend("/topic/admin/orders", event);
    }

    private OrderUpdateEvent buildEvent(Order order, String message, String eventType) {
        return OrderUpdateEvent.builder()
                .orderId(order.getId())
                .orderCode(order.getOrderCode())
                .status(order.getStatus() != null ? order.getStatus().name() : null)
                .paymentStatus(order.getPayment() != null && order.getPayment().getStatus() != null ? order.getPayment().getStatus().name() : null)
                .createdAt(order.getCreatedAt())
                .customerName(order.getUser().getFullName())
                .finalPrice(order.getFinalPrice())
                .message(message)
                .eventType(eventType)
                .build();
    }
}
