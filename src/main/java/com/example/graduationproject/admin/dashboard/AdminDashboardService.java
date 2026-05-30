package com.example.graduationproject.admin.dashboard;

import com.example.graduationproject.admin.dashboard.dto.AdminDashboardSummaryResponse;
import com.example.graduationproject.admin.dashboard.dto.AdminRevenueChartDataResponse;
import com.example.graduationproject.admin.dashboard.dto.AdminRevenueStatsResponse;
import com.example.graduationproject.admin.dashboard.dto.TopSellingProductResponse;
import com.example.graduationproject.admin.dashboard.dto.AdminCategoryStatsResponse;
import com.example.graduationproject.admin.dashboard.dto.AdminLowStockVariantResponse;
import com.example.graduationproject.admin.order.dto.AdminOrderListItemResponse;
import com.example.graduationproject.entity.Order;
import com.example.graduationproject.entity.OrderItem;
import com.example.graduationproject.entity.Variant;
import com.example.graduationproject.entity.enums.OrderStatus;
import com.example.graduationproject.payment.repository.OrderRepository;
import com.example.graduationproject.payment.repository.ProductRepository;
import com.example.graduationproject.payment.repository.VariantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class AdminDashboardService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final VariantRepository variantRepository;

    @Transactional(readOnly = true)
    public AdminDashboardSummaryResponse getSummary() {
        BigDecimal totalRevenue = orderRepository.sumFinalPriceByStatus(OrderStatus.DELIVERED);
        long totalOrders = orderRepository.countByStatusNot(OrderStatus.CANCELLED);
        long totalCustomersPurchased = orderRepository.countDistinctUsersByStatusNot(OrderStatus.CANCELLED);
        long totalProductsSold = orderRepository.sumSoldQuantityByOrderStatus(OrderStatus.DELIVERED);

        List<AdminOrderListItemResponse> recentOrders = orderRepository.findTop5ByOrderByCreatedAtDesc().stream()
                .map(this::toOrderListItem)
                .toList();

        List<TopSellingProductResponse> topSellingProducts = orderRepository.findTopSellingProducts(
                        OrderStatus.DELIVERED,
                        PageRequest.of(0, 5)
                ).stream()
                .map(this::toTopSellingProduct)
                .toList();

        return AdminDashboardSummaryResponse.builder()
                .totalRevenue(totalRevenue != null ? totalRevenue : BigDecimal.ZERO)
                .totalOrders(totalOrders)
                .totalCustomersPurchased(totalCustomersPurchased)
                .totalProductsSold(totalProductsSold)
                .recentOrders(recentOrders)
                .topSellingProducts(topSellingProducts)
                .build();
    }

    private AdminOrderListItemResponse toOrderListItem(Order order) {
        int totalItems = (order.getItems() != null ? order.getItems() : List.<OrderItem>of()).stream()
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

    private TopSellingProductResponse toTopSellingProduct(Object[] row) {
        String productId = row[0] != null ? row[0].toString() : null;
        String productName = row[1] != null ? row[1].toString() : null;
        long soldQuantity = row[2] instanceof Number number ? number.longValue() : 0L;
        BigDecimal revenue = row[3] instanceof BigDecimal value ? value : BigDecimal.ZERO;

        String imageUrl = row[4] != null ? row[4].toString() : null;

        return TopSellingProductResponse.builder()
                .productId(productId)
                .productName(productName)
                .soldQuantity(soldQuantity)
                .revenue(revenue)
                .imageUrl(imageUrl)
                .build();
    }

    @Transactional(readOnly = true)
    public AdminRevenueStatsResponse getRevenueStats() {
        LocalDate today = LocalDate.now();

        LocalDateTime startOfToday = today.atStartOfDay();
        LocalDateTime startOfTomorrow = today.plusDays(1).atStartOfDay();

        LocalDate firstDayOfMonth = today.withDayOfMonth(1);
        LocalDateTime startOfMonth = firstDayOfMonth.atStartOfDay();
        LocalDateTime startOfNextMonth = firstDayOfMonth.plusMonths(1).atStartOfDay();

        LocalDate firstDayOfYear = today.withDayOfYear(1);
        LocalDateTime startOfYear = firstDayOfYear.atStartOfDay();
        LocalDateTime startOfNextYear = firstDayOfYear.plusYears(1).atStartOfDay();

        BigDecimal todayRevenue = orderRepository.sumRevenueByStatusAndBusinessDateBetween(OrderStatus.DELIVERED, startOfToday, startOfTomorrow);
        BigDecimal monthRevenue = orderRepository.sumRevenueByStatusAndBusinessDateBetween(OrderStatus.DELIVERED, startOfMonth, startOfNextMonth);
        BigDecimal yearRevenue = orderRepository.sumRevenueByStatusAndBusinessDateBetween(OrderStatus.DELIVERED, startOfYear, startOfNextYear);

        return AdminRevenueStatsResponse.builder()
                .todayRevenue(todayRevenue != null ? todayRevenue : BigDecimal.ZERO)
                .monthRevenue(monthRevenue != null ? monthRevenue : BigDecimal.ZERO)
                .yearRevenue(yearRevenue != null ? yearRevenue : BigDecimal.ZERO)
                .build();
    }

    @Transactional(readOnly = true)
    public List<AdminRevenueChartDataResponse> getRevenueChart(int days) {
        int safeDays = Math.max(1, Math.min(days, 90));
        LocalDate today = LocalDate.now();
        List<AdminRevenueChartDataResponse> chartData = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM");

        for (int i = safeDays - 1; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            LocalDateTime startOfDay = date.atStartOfDay();
            LocalDateTime startOfNextDay = date.plusDays(1).atStartOfDay();

            BigDecimal dailyRevenue = orderRepository.sumRevenueByStatusAndBusinessDateBetween(
                    OrderStatus.DELIVERED, startOfDay, startOfNextDay);

            chartData.add(AdminRevenueChartDataResponse.builder()
                    .date(date.format(formatter))
                    .revenue(dailyRevenue != null ? dailyRevenue : BigDecimal.ZERO)
                    .build());
        }

        return chartData;
    }

    @Transactional(readOnly = true)
    public List<AdminCategoryStatsResponse> getCategoryStats() {
        return productRepository.getProductCountByCategory().stream()
                .map(projection -> AdminCategoryStatsResponse.builder()
                        .name(projection.getName())
                        .value(projection.getValue())
                        .build())
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AdminLowStockVariantResponse> getLowStockVariants(int limit, int threshold) {
        int safeLimit = Math.max(1, Math.min(limit, 50));
        int safeThreshold = Math.max(0, threshold);

        return variantRepository.findAll().stream()
                .filter(variant -> variant.getStatus() != null && variant.getStatus().name().equals("ACTIVE"))
                .filter(variant -> resolveEffectiveStock(variant) <= safeThreshold)
                .sorted(Comparator.comparingInt(this::resolveEffectiveStock))
                .limit(safeLimit)
                .map(this::toLowStockVariant)
                .toList();
    }

    private int resolveEffectiveStock(Variant variant) {
        Integer productStockRaw = variant.getProduct() != null ? variant.getProduct().getTotalQuantity() : null;
        Integer variantStockRaw = variant.getStockQuantity();
        if (productStockRaw != null && variantStockRaw != null) {
            return Math.min(productStockRaw, variantStockRaw);
        }
        if (productStockRaw != null) {
            return productStockRaw;
        }
        return variantStockRaw != null ? variantStockRaw : 0;
    }

    private AdminLowStockVariantResponse toLowStockVariant(Variant variant) {
        return AdminLowStockVariantResponse.builder()
                .variantId(variant.getId())
                .productId(variant.getProduct() != null ? variant.getProduct().getId() : null)
                .productName(variant.getProduct() != null ? variant.getProduct().getName() : "Sản phẩm không xác định")
                .sku(variant.getSku())
                .color(variant.getColor())
                .size(variant.getSize() != null ? variant.getSize().getName() : null)
                .imageUrl(variant.getImageUrl())
                .stockQuantity(resolveEffectiveStock(variant))
                .build();
    }
}
