package com.example.graduationproject.admin.order;

import com.example.graduationproject.admin.order.dto.AdminOrderHistoryItemResponse;
import com.example.graduationproject.admin.order.dto.AdminOrderListItemResponse;
import com.example.graduationproject.admin.order.dto.AdminUpdateOrderStatusRequest;
import com.example.graduationproject.entity.Order;
import com.example.graduationproject.entity.OrderItem;
import com.example.graduationproject.entity.OrderStatusHistory;
import com.example.graduationproject.entity.User;
import com.example.graduationproject.entity.Variant;
import com.example.graduationproject.entity.enums.OrderStatus;
import com.example.graduationproject.entity.enums.PaymentStatus;
import com.example.graduationproject.entity.enums.ShippingStatus;
import com.example.graduationproject.exception.BadRequestException;
import com.example.graduationproject.exception.NotFoundException;
import com.example.graduationproject.payment.repository.OrderRepository;
import com.example.graduationproject.payment.repository.OrderStatusHistoryRepository;
import com.example.graduationproject.payment.repository.UserRepository;
import com.example.graduationproject.service.OrderService;
import com.example.graduationproject.service.WebSocketNotificationService;
import com.example.graduationproject.service.dto.OrderDetailResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.EnumSet;
import java.util.List;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class AdminOrderService {

    private final OrderRepository orderRepository;
    private final OrderStatusHistoryRepository orderStatusHistoryRepository;
    private final UserRepository userRepository;
    private final OrderService orderService;
    private final WebSocketNotificationService webSocketNotificationService;
    private final MongoTemplate mongoTemplate;

    @Transactional(readOnly = true)
    public Page<AdminOrderListItemResponse> getOrders(String keyword, String status, Pageable pageable) {
        OrderStatus orderStatus = parseStatus(status);
        return searchOrders(normalize(keyword), orderStatus, pageable)
                .map(this::toListItem);
    }

    private Page<Order> searchOrders(String keyword, OrderStatus status, Pageable pageable) {
        Query query = new Query();
        List<Criteria> criteriaList = new ArrayList<>();

        if (keyword != null && !keyword.isBlank()) {
            Pattern keywordPattern = Pattern.compile(Pattern.quote(keyword.trim()), Pattern.CASE_INSENSITIVE);
            criteriaList.add(Criteria.where("orderCode").regex(keywordPattern));
        }
        if (status != null) {
            criteriaList.add(Criteria.where("status").is(status.name()));
        }
        if (!criteriaList.isEmpty()) {
            query.addCriteria(new Criteria().andOperator(criteriaList.toArray(new Criteria[0])));
        }

        long total = mongoTemplate.count(query, Order.class);
        query.with(pageable);
        return new PageImpl<>(mongoTemplate.find(query, Order.class), pageable, total);
    }

    @Transactional(readOnly = true)
    public OrderDetailResponse getOrderDetail(String id) {
        return orderService.getOrderDetail(id);
    }

    @Transactional(readOnly = true)
    public List<AdminOrderHistoryItemResponse> getOrderHistory(String orderId) {
        ensureOrderExists(orderId);
        return orderStatusHistoryRepository.findByOrderIdOrderByChangedAtDesc(orderId).stream()
                .map(history -> AdminOrderHistoryItemResponse.builder()
                        .id(history.getId())
                        .status(history.getStatus() != null ? history.getStatus().name() : null)
                        .note(history.getNote())
                        .actorName(resolveHistoryActorName(history))
                        .changedAt(history.getChangedAt())
                        .build())
                .toList();
    }

    @Transactional
    public OrderDetailResponse updateStatus(String orderId, AdminUpdateOrderStatusRequest request) {
        Order order = orderRepository.findDetailedById(orderId)
                .orElseThrow(() -> new NotFoundException("Order not found with id: " + orderId));

        OrderStatus nextStatus = parseRequiredStatus(request.getStatus());
        validateTransition(order.getStatus(), nextStatus);

        order.setStatus(nextStatus);
        syncShippingStatus(order, nextStatus);
        syncPaymentStatus(order, nextStatus);
        orderStatusHistoryRepository.save(OrderStatusHistory.builder()
                .order(order)
                .status(nextStatus)
                .note(request.getNote() != null && !request.getNote().isBlank() ? request.getNote() : "Updated by admin")
                .actorName(resolveCurrentActorName())
                .changedAt(LocalDateTime.now())
                .build());

        if (nextStatus == OrderStatus.CANCELLED) {
            restoreStock(order);
        }

        Order saved = orderRepository.save(order);
        webSocketNotificationService.notifyOrderStatusUpdate(saved, "Admin updated order status", "ADMIN_ORDER_STATUS_UPDATED");
        return orderService.getOrderDetail(saved.getId());
    }

    @Transactional
    public OrderDetailResponse approveReturnRequest(String orderId, String note) {
        OrderDetailResponse response = orderService.approveReturnRequest(orderId, note);
        orderStatusHistoryRepository.save(OrderStatusHistory.builder()
                .order(orderRepository.findById(orderId).orElseThrow(() -> new NotFoundException("Order not found")))
                .status(OrderStatus.valueOf(response.getStatus()))
                .note(note != null && !note.isBlank() ? note : "Admin duyệt yêu cầu trả hàng")
                .actorName(resolveCurrentActorName())
                .changedAt(LocalDateTime.now())
                .build());
        return orderService.getOrderDetail(orderId);
    }

    @Transactional
    public OrderDetailResponse rejectReturnRequest(String orderId, String note) {
        OrderDetailResponse response = orderService.rejectReturnRequest(orderId, note);
        orderStatusHistoryRepository.save(OrderStatusHistory.builder()
                .order(orderRepository.findById(orderId).orElseThrow(() -> new NotFoundException("Order not found")))
                .status(OrderStatus.valueOf(response.getStatus()))
                .note(note != null && !note.isBlank() ? note : "Admin từ chối yêu cầu trả hàng")
                .actorName(resolveCurrentActorName())
                .changedAt(LocalDateTime.now())
                .build());
        return orderService.getOrderDetail(orderId);
    }

    private void ensureOrderExists(String orderId) {
        if (!orderRepository.existsById(orderId)) {
            throw new NotFoundException("Order not found with id: " + orderId);
        }
    }

    private String resolveCurrentActorName() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getPrincipal() == null) {
            return "Quản trị viên";
        }

        String email = null;
        Object principal = authentication.getPrincipal();
        if (principal instanceof UserDetails userDetails) {
            email = userDetails.getUsername();
        } else if (principal instanceof String principalValue && !"anonymousUser".equalsIgnoreCase(principalValue)) {
            email = principalValue;
        }

        if (email == null || email.isBlank()) {
            return "Quản trị viên";
        }

        return userRepository.findByEmail(email)
                .map(User::getFullName)
                .filter(name -> name != null && !name.isBlank())
                .orElse(email);
    }

    private String resolveHistoryActorName(OrderStatusHistory history) {
        if (history.getActorName() != null && !history.getActorName().isBlank()) {
            return history.getActorName();
        }
        String note = history.getNote() != null ? history.getNote() : "";
        String normalized = note.toLowerCase();
        if (normalized.contains("returned by user") || normalized.contains("khách hàng gửi yêu cầu trả")) {
            return "Khách hàng";
        }
        if (normalized.contains("admin")) {
            return "Quản trị viên";
        }
        if (normalized.contains("shipping")) {
            return "Vận chuyển";
        }
        return "Hệ thống";
    }

    private AdminOrderListItemResponse toListItem(Order order) {
        int totalItems = order.getItems().stream()
                .map(OrderItem::getQuantity)
                .filter(java.util.Objects::nonNull)
                .mapToInt(Integer::intValue)
                .sum();

        return AdminOrderListItemResponse.builder()
                .id(order.getId())
                .orderCode(order.getOrderCode())
                .createdAt(order.getCreatedAt())
                .status(order.getStatus() != null ? order.getStatus().name() : null)
                .shippingStatus(order.getShipping() != null && order.getShipping().getStatus() != null ? order.getShipping().getStatus().name() : null)
                .paymentStatus(order.getPayment() != null && order.getPayment().getStatus() != null ? order.getPayment().getStatus().name() : null)
                .customerName(order.getUser() != null ? order.getUser().getFullName() : null)
                .customerEmail(order.getUser() != null ? order.getUser().getEmail() : null)
                .finalPrice(order.getFinalPrice())
                .totalItems(totalItems)
                .build();
    }

    private void validateTransition(OrderStatus current, OrderStatus next) {
        if (current == next) {
            return;
        }
        boolean valid = switch (current) {
            case PENDING -> EnumSet.of(OrderStatus.CONFIRMED, OrderStatus.CANCELLED).contains(next);
            case CONFIRMED -> EnumSet.of(OrderStatus.PROCESSING, OrderStatus.CANCELLED).contains(next);
            case PROCESSING -> EnumSet.of(OrderStatus.SHIPPING, OrderStatus.CANCELLED).contains(next);
            case SHIPPING -> next == OrderStatus.DELIVERED;
            case DELIVERED, RETURN_REQUESTED, CANCELLED, RETURNED -> false;
        };
        if (!valid) {
            throw new BadRequestException("Invalid order status transition: " + current + " -> " + next);
        }
    }

    private void restoreStock(Order order) {
        for (OrderItem item : order.getItems()) {
            Variant variant = item.getVariant();
            if (variant == null || item.getQuantity() == null) {
                continue;
            }
            int variantStock = variant.getStockQuantity() != null ? variant.getStockQuantity() : 0;
            variant.setStockQuantity(variantStock + item.getQuantity());
            if (variant.getProduct() != null) {
                int productStock = variant.getProduct().getTotalQuantity() != null ? variant.getProduct().getTotalQuantity() : 0;
                variant.getProduct().setTotalQuantity(productStock + item.getQuantity());
            }
        }
    }

    private void syncShippingStatus(Order order, OrderStatus status) {
        if (order.getShipping() == null) {
            return;
        }
        ShippingStatus shippingStatus = switch (status) {
            case PENDING, CONFIRMED -> ShippingStatus.PENDING;
            case PROCESSING -> ShippingStatus.PACKING;
            case SHIPPING -> ShippingStatus.SHIPPING;
            case DELIVERED -> ShippingStatus.DELIVERED;
            case CANCELLED, RETURNED, RETURN_REQUESTED -> ShippingStatus.FAILED;
        };
        order.getShipping().setStatus(shippingStatus);
        if (status == OrderStatus.SHIPPING) {
            order.getShipping().setShippedAt(LocalDateTime.now());
        }
        if (status == OrderStatus.DELIVERED) {
            order.getShipping().setDeliveredAt(LocalDateTime.now());
        }
    }

    private void syncPaymentStatus(Order order, OrderStatus status) {
        if (order.getPayment() == null) {
            return;
        }
        if (status == OrderStatus.CANCELLED && order.getPayment().getStatus() == PaymentStatus.PENDING) {
            order.getPayment().setStatus(PaymentStatus.FAILED);
            order.getPayment().setNote("Cancelled by admin");
        }
        if (status == OrderStatus.DELIVERED && order.getPayment().getStatus() == PaymentStatus.PENDING) {
            order.getPayment().setStatus(PaymentStatus.PAID);
            order.getPayment().setNote("Marked paid when order delivered by admin");
        }
    }

    private String normalize(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }

    private OrderStatus parseStatus(String status) {
        if (status == null || status.isBlank()) {
            return null;
        }
        return parseRequiredStatus(status);
    }

    private OrderStatus parseRequiredStatus(String status) {
        try {
            return OrderStatus.valueOf(status.trim().toUpperCase());
        } catch (Exception ex) {
            throw new BadRequestException("Invalid order status: " + status);
        }
    }
}
