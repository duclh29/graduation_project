package com.example.graduationproject.payment.scheduler;

import com.example.graduationproject.entity.Order;
import com.example.graduationproject.entity.OrderItem;
import com.example.graduationproject.entity.OrderStatusHistory;
import com.example.graduationproject.entity.Variant;
import com.example.graduationproject.entity.enums.OrderStatus;
import com.example.graduationproject.entity.enums.PaymentStatus;
import com.example.graduationproject.payment.repository.OrderRepository;
import com.example.graduationproject.payment.repository.OrderStatusHistoryRepository;
import com.example.graduationproject.payment.repository.PaymentRepository;
import com.example.graduationproject.service.OrderService;
import com.example.graduationproject.service.WebSocketNotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class PaymentTimeoutScheduler {

    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final OrderStatusHistoryRepository orderStatusHistoryRepository;
    private final WebSocketNotificationService webSocketNotificationService;
    private final OrderService orderService;

    @Scheduled(cron = "0 * * * * *") // Runs every 1 minute
    @Transactional
    public void cancelExpiredOnlineOrders() {
        LocalDateTime expireTime = LocalDateTime.now().minusMinutes(15);
        List<Order> pendingOrders = orderRepository.findByStatusAndCreatedAtLessThan(OrderStatus.PENDING, expireTime);

        List<Order> expiredOrders = pendingOrders.stream()
                .filter(order -> {
                    var payment = order.getPayment();
                    return payment != null 
                            && PaymentStatus.PENDING == payment.getStatus()
                            && ("VNPAY".equals(payment.getProvider()) || "MOMO".equals(payment.getProvider()));
                })
                .toList();

        if (expiredOrders.isEmpty()) {
            return;
        }


        log.info("Found {} expired online orders to auto-cancel", expiredOrders.size());

        for (Order order : expiredOrders) {
            try {
                // Cancel Order
                order.setStatus(OrderStatus.CANCELLED);

                // Cancel Payment
                if (order.getPayment() != null) {
                    order.getPayment().setStatus(PaymentStatus.FAILED);
                    order.getPayment().setNote("Auto-cancelled: Payment timeout (> 15 minutes)");
                    paymentRepository.save(order.getPayment());
                }

                // Restore stock
                if (order.getItems() != null) {
                    for (OrderItem item : order.getItems()) {
                        Variant variant = item.getVariant();
                        if (variant != null && item.getQuantity() != null) {
                            int quantity = Math.max(item.getQuantity(), 0);
                            int variantStock = variant.getStockQuantity() != null ? variant.getStockQuantity() : 0;
                            variant.setStockQuantity(variantStock + quantity);

                            if (variant.getProduct() != null && variant.getProduct().getTotalQuantity() != null) {
                                int productStock = variant.getProduct().getTotalQuantity();
                                variant.getProduct().setTotalQuantity(productStock + quantity);
                            }
                        }
                    }
                }
                
                // Restore coupon usage
                orderService.restoreCouponUsage(order);
 
                // Save status history
                orderStatusHistoryRepository.save(OrderStatusHistory.builder()
                        .order(order)
                        .status(OrderStatus.CANCELLED)
                        .note("System auto-cancelled: Payment timeout (> 15 minutes)")
                        .changedAt(LocalDateTime.now())
                        .build());

                orderRepository.save(order);

                // Notify client via websocket
                webSocketNotificationService.notifyOrderStatusUpdate(
                        order, 
                        "Order auto-cancelled due to payment timeout", 
                        "ORDER_CANCELLED"
                );

                log.info("Successfully auto-cancelled expired order: {}", order.getOrderCode());

            } catch (Exception ex) {
                log.error("Failed to auto-cancel expired order ID: " + order.getId(), ex);
            }
        }
    }
}
