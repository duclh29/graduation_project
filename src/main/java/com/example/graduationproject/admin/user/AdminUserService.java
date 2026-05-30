package com.example.graduationproject.admin.user;

import com.example.graduationproject.admin.order.dto.AdminOrderListItemResponse;
import com.example.graduationproject.admin.user.dto.AdminUserDetailResponse;
import com.example.graduationproject.admin.user.dto.AdminUserListItemResponse;
import com.example.graduationproject.entity.Order;
import com.example.graduationproject.entity.OrderItem;
import com.example.graduationproject.entity.User;
import com.example.graduationproject.entity.enums.OrderStatus;
import com.example.graduationproject.entity.enums.RoleName;
import com.example.graduationproject.entity.enums.UserStatus;
import com.example.graduationproject.exception.BadRequestException;
import com.example.graduationproject.exception.NotFoundException;
import com.example.graduationproject.payment.repository.OrderRepository;
import com.example.graduationproject.payment.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class AdminUserService {

    private final UserRepository userRepository;
    private final OrderRepository orderRepository;

    @Transactional(readOnly = true)
    public Page<AdminUserListItemResponse> getUsers(String keyword, String status, Pageable pageable) {
        UserStatus userStatus = parseStatus(status);
        return userRepository.searchAdminUsers(normalize(keyword), userStatus, RoleName.CUSTOMER, pageable)
                .map(this::toListItem);
    }

    @Transactional(readOnly = true)
    public AdminUserDetailResponse getUser(String id) {
        User user = userRepository.findAdminUserById(id, RoleName.CUSTOMER)
                .orElseThrow(() -> new NotFoundException("User not found with id: " + id));

        List<Order> orders = orderRepository.findByUserIdOrderByCreatedAtDesc(id);

        return AdminUserDetailResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .status(user.getStatus() != null ? user.getStatus().name() : null)
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .totalOrders(orders.size())
                .deliveredOrders(orders.stream().filter(order -> order.getStatus() == OrderStatus.DELIVERED).count())
                .cancelledOrders(orders.stream().filter(order -> order.getStatus() == OrderStatus.CANCELLED).count())
                .totalSpent(calculateDeliveredSpend(orders))
                .lastOrderAt(orders.stream().map(Order::getCreatedAt).filter(Objects::nonNull).max(Comparator.naturalOrder()).orElse(null))
                .recentOrders(orders.stream().limit(5).map(this::toOrderListItem).toList())
                .build();
    }

    @Transactional
    public AdminUserDetailResponse updateStatus(String id, String status) {
        User user = userRepository.findAdminUserById(id, RoleName.CUSTOMER)
                .orElseThrow(() -> new NotFoundException("User not found with id: " + id));

        user.setStatus(parseRequiredStatus(status));
        userRepository.save(user);
        return getUser(id);
    }

    private AdminUserListItemResponse toListItem(User user) {
        List<Order> orders = orderRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        return AdminUserListItemResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .status(user.getStatus() != null ? user.getStatus().name() : null)
                .createdAt(user.getCreatedAt())
                .lastOrderAt(orders.stream().map(Order::getCreatedAt).filter(Objects::nonNull).max(Comparator.naturalOrder()).orElse(null))
                .totalOrders(orders.size())
                .totalSpent(calculateDeliveredSpend(orders))
                .build();
    }

    private BigDecimal calculateDeliveredSpend(List<Order> orders) {
        return orders.stream()
                .filter(order -> order.getStatus() == OrderStatus.DELIVERED)
                .map(Order::getFinalPrice)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private AdminOrderListItemResponse toOrderListItem(Order order) {
        int totalItems = order.getItems().stream()
                .map(OrderItem::getQuantity)
                .filter(Objects::nonNull)
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

    private String normalize(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }

    private UserStatus parseStatus(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return UserStatus.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Invalid user status: " + value);
        }
    }

    private UserStatus parseRequiredStatus(String value) {
        if (value == null || value.isBlank()) {
            throw new BadRequestException("User status is required");
        }
        try {
            return UserStatus.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Invalid user status: " + value);
        }
    }
}
