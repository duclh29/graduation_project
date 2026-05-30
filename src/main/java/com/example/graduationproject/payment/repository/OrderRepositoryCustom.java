package com.example.graduationproject.payment.repository;

import com.example.graduationproject.entity.enums.OrderStatus;
import com.example.graduationproject.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public interface OrderRepositoryCustom {
    Long sumSoldQuantityByOrderStatus(OrderStatus status);
    List<Object[]> findTopSellingProducts(OrderStatus status, Pageable pageable);
    BigDecimal sumFinalPriceByStatus(OrderStatus status);
    BigDecimal sumFinalPriceByStatusAndCreatedAtBetween(OrderStatus status, LocalDateTime from, LocalDateTime to);
    BigDecimal sumRevenueByStatusAndBusinessDateBetween(OrderStatus status, LocalDateTime from, LocalDateTime to);
    long countDistinctUsersByStatusNot(OrderStatus status);
    Page<Order> searchAdminOrders(String keyword, OrderStatus status, Pageable pageable);
    org.springframework.data.domain.Page<com.example.graduationproject.entity.Order> searchPosOrdersCustom(String keyword, org.springframework.data.domain.Pageable pageable);
}
