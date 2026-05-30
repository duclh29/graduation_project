package com.example.graduationproject.admin.pos;

import com.example.graduationproject.admin.pos.dto.AdminPosCashierSessionRequest;
import com.example.graduationproject.admin.pos.dto.AdminPosCashierSessionResponse;
import com.example.graduationproject.admin.pos.dto.AdminPosCouponPreviewResponse;
import com.example.graduationproject.admin.pos.dto.AdminPosCreateOrderRequest;
import com.example.graduationproject.admin.pos.dto.AdminPosOrderItemRequest;
import com.example.graduationproject.admin.pos.dto.AdminPosOrderItemResponse;
import com.example.graduationproject.admin.pos.dto.AdminPosOrderResponse;
import com.example.graduationproject.admin.pos.dto.AdminPosPaymentRequest;
import com.example.graduationproject.admin.pos.dto.AdminPosPaymentResponse;
import com.example.graduationproject.admin.pos.dto.AdminPosReturnExchangeItemRequest;
import com.example.graduationproject.admin.pos.dto.AdminPosReturnExchangeRequest;
import com.example.graduationproject.admin.pos.dto.AdminPosReturnExchangeResponse;
import com.example.graduationproject.admin.pos.dto.AdminPosVariantLookupResponse;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.example.graduationproject.entity.CashierSession;
import com.example.graduationproject.entity.Coupon;
import com.example.graduationproject.entity.CouponUsage;
import com.example.graduationproject.entity.Order;
import com.example.graduationproject.entity.OrderItem;
import com.example.graduationproject.entity.OrderStatusHistory;
import com.example.graduationproject.entity.Payment;
import com.example.graduationproject.entity.PosPaymentAllocation;
import com.example.graduationproject.entity.PosReturnExchangeLog;
import com.example.graduationproject.entity.Role;
import com.example.graduationproject.entity.User;
import com.example.graduationproject.entity.Variant;
import com.example.graduationproject.entity.enums.OrderStatus;
import com.example.graduationproject.entity.enums.PaymentMethod;
import com.example.graduationproject.entity.enums.PaymentStatus;
import com.example.graduationproject.entity.enums.RoleName;
import com.example.graduationproject.entity.enums.UserStatus;
import com.example.graduationproject.entity.enums.VariantStatus;
import com.example.graduationproject.exception.BadRequestException;
import com.example.graduationproject.exception.NotFoundException;
import com.example.graduationproject.payment.repository.CashierSessionRepository;
import com.example.graduationproject.payment.repository.CouponUsageRepository;
import com.example.graduationproject.payment.repository.OrderRepository;
import com.example.graduationproject.payment.repository.OrderStatusHistoryRepository;
import com.example.graduationproject.payment.repository.PosPaymentAllocationRepository;
import com.example.graduationproject.payment.repository.PosReturnExchangeLogRepository;
import com.example.graduationproject.payment.repository.RoleRepository;
import com.example.graduationproject.payment.repository.UserRepository;
import com.example.graduationproject.payment.repository.VariantRepository;
import com.example.graduationproject.payment.repository.PaymentRepository;
import com.example.graduationproject.payment.repository.OrderItemRepository;
import com.example.graduationproject.service.coupon.CouponService;
import com.example.graduationproject.service.WebSocketNotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminPosService {

    private static final ObjectMapper QR_OBJECT_MAPPER = new ObjectMapper();
    private static final List<String> PRODUCT_QR_CODE_KEYS = List.of("productId", "product_id", "product");
    private static final List<String> QR_CODE_KEYS = List.of("sku", "variantId", "variant_id", "variant", "code", "id");

    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final OrderItemRepository orderItemRepository;
    private final VariantRepository variantRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final CouponService couponService;
    private final CouponUsageRepository couponUsageRepository;
    private final PosPaymentAllocationRepository posPaymentAllocationRepository;
    private final CashierSessionRepository cashierSessionRepository;
    private final PosReturnExchangeLogRepository posReturnExchangeLogRepository;
    private final OrderStatusHistoryRepository orderStatusHistoryRepository;
    private final PasswordEncoder passwordEncoder;
    private final WebSocketNotificationService webSocketNotificationService;

    @Transactional(readOnly = true)
    public AdminPosVariantLookupResponse lookupVariant(String code) {
        String normalizedCode = normalizeQrCode(code);
        Variant variant = findVariantByCode(normalizedCode);
        return AdminPosVariantLookupResponse.builder()
                .productId(variant.getProduct().getId())
                .productName(variant.getProduct().getName())
                .variantId(variant.getId())
                .sku(variant.getSku())
                .size(variant.getSize().getName())
                .color(variant.getColor())
                .stockQuantity(variant.getStockQuantity())
                .status(variant.getStatus().name())
                .price(variant.getProduct().getBasePrice()
                        .add(variant.getAdditionalPrice() != null ? variant.getAdditionalPrice() : BigDecimal.ZERO)
                        .setScale(2, RoundingMode.HALF_UP))
                .imageUrl(variant.getImageUrl())
                .build();
    }

    @Transactional(readOnly = true)
    public Page<AdminPosOrderResponse> getPosOrders(String keyword, Pageable pageable) {
        return orderRepository.searchPosOrdersCustom(normalize(keyword), pageable).map(this::toResponse);
    }


    @Transactional(readOnly = true)
    public AdminPosOrderResponse getPosOrder(String id) {
        Order order = orderRepository.findDetailedById(id)
                .orElseThrow(() -> new NotFoundException("POS order not found with id: " + id));
        if (order.getPayment() == null || !"POS".equals(order.getPayment().getProvider())) {
            throw new NotFoundException("POS order not found with id: " + id);
        }
        return toResponse(order);
    }

    @Transactional(readOnly = true)
    public AdminPosCouponPreviewResponse previewCoupon(AdminPosCreateOrderRequest request) {
        BigDecimal subtotal = calculatePosSubtotal(request.getItems());
        BigDecimal manualDiscount = normalizeMoney(request.getManualDiscount());
        if (manualDiscount.compareTo(subtotal) > 0) {
            throw new BadRequestException("Manual discount cannot be greater than subtotal");
        }

        BigDecimal couponBaseAmount = subtotal.subtract(manualDiscount).max(BigDecimal.ZERO).setScale(2, RoundingMode.HALF_UP);
        User customer = resolvePreviewCustomer(request);
        Coupon coupon = couponService.validateCouponReadOnly(request.getCouponCode(), customer, couponBaseAmount);
        BigDecimal couponDiscount = couponService.calculateDiscount(coupon, couponBaseAmount);
        BigDecimal discountAmount = manualDiscount.add(couponDiscount).setScale(2, RoundingMode.HALF_UP);
        BigDecimal finalPrice = subtotal.subtract(discountAmount).max(BigDecimal.ZERO).setScale(2, RoundingMode.HALF_UP);

        return AdminPosCouponPreviewResponse.builder()
                .couponCode(coupon != null ? coupon.getCode() : null)
                .subtotalAmount(subtotal.setScale(2, RoundingMode.HALF_UP))
                .manualDiscount(manualDiscount)
                .couponDiscount(couponDiscount)
                .discountAmount(discountAmount)
                .finalPrice(finalPrice)
                .build();
    }

    @Transactional
    public AdminPosOrderResponse createCounterOrder(AdminPosCreateOrderRequest request) {
        User customer = resolveCustomer(request);
        BigDecimal manualDiscount = normalizeMoney(request.getManualDiscount());

        Order order = Order.builder()
                .orderCode(generatePosOrderCode())
                .user(customer)
                .status(OrderStatus.DELIVERED)
                .subtotalAmount(BigDecimal.ZERO)
                .discountAmount(BigDecimal.ZERO)
                .shippingFee(BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP))
                .finalPrice(BigDecimal.ZERO)
                .note(request.getNote() != null && !request.getNote().isBlank()
                        ? request.getNote()
                        : "POS counter sale")
                .build();

        BigDecimal subtotal = BigDecimal.ZERO;
        List<AdminPosOrderItemRequest> items = mergeDuplicateItems(request.getItems());
        if (items.isEmpty()) {
            throw new BadRequestException("Order items are required");
        }
        for (AdminPosOrderItemRequest item : items) {
            Variant variant = variantRepository.findWithProductById(String.valueOf(item.getVariantId()))
                    .orElseThrow(() -> new NotFoundException("Variant not found with id: " + item.getVariantId()));
            validateVariantForSale(variant, item.getQuantity());

            BigDecimal unitPrice = variant.getProduct().getBasePrice()
                    .add(variant.getAdditionalPrice() != null ? variant.getAdditionalPrice() : BigDecimal.ZERO)
                    .setScale(2, RoundingMode.HALF_UP);
            BigDecimal lineTotal = unitPrice.multiply(BigDecimal.valueOf(item.getQuantity())).setScale(2, RoundingMode.HALF_UP);
            subtotal = subtotal.add(lineTotal);

            decrementStock(variant, item.getQuantity());

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .variant(variant)
                    .productName(variant.getProduct().getName())
                    .skuSnapshot(variant.getSku())
                    .sizeSnapshot(variant.getSize().getName())
                    .colorSnapshot(variant.getColor())
                    .quantity(item.getQuantity())
                    .unitPrice(unitPrice)
                    .totalPrice(lineTotal)
                    .build();
            order.getItems().add(orderItem);
        }

        if (manualDiscount.compareTo(subtotal) > 0) {
            throw new BadRequestException("Manual discount cannot be greater than subtotal");
        }

        BigDecimal couponBaseAmount = subtotal.subtract(manualDiscount).max(BigDecimal.ZERO).setScale(2, RoundingMode.HALF_UP);
        Coupon coupon = couponService.validateCoupon(request.getCouponCode(), customer, couponBaseAmount);
        BigDecimal couponDiscount = couponService.calculateDiscount(coupon, couponBaseAmount);
        BigDecimal discountAmount = manualDiscount.add(couponDiscount).setScale(2, RoundingMode.HALF_UP);

        BigDecimal finalPrice = subtotal.subtract(discountAmount).max(BigDecimal.ZERO).setScale(2, RoundingMode.HALF_UP);
        PaymentMethod primaryPaymentMethod = resolvePrimaryPaymentMethod(request);
        order.setSubtotalAmount(subtotal.setScale(2, RoundingMode.HALF_UP));
        order.setDiscountAmount(discountAmount);
        order.setFinalPrice(finalPrice);
        order.setCoupon(coupon);

        Payment payment = Payment.builder()
                .order(order)
                .user(customer)
                .method(primaryPaymentMethod)
                .provider("POS")
                .transactionCode("POS-" + UUID.randomUUID())
                .status(PaymentStatus.PAID)
                .amount(finalPrice)
                .paidAt(LocalDateTime.now())
                .note(primaryPaymentMethod == PaymentMethod.MIXED ? "Paid at counter with multiple methods" : "Paid at counter")
                .build();
        order.setPayment(payment);

        Order savedOrder = orderRepository.save(order);

        // Save POS OrderItems
        for (OrderItem item : order.getItems()) {
            item.setOrder(savedOrder);
            orderItemRepository.save(item);
        }

        // Save POS Payment
        payment.setOrder(savedOrder);
        Payment savedPayment = paymentRepository.save(payment);
        savedOrder.setPayment(savedPayment);

        // Re-save order to capture linked payment
        savedOrder = orderRepository.save(savedOrder);

        List<PosPaymentAllocation> allocations = buildPaymentAllocations(request, savedOrder, finalPrice);
        posPaymentAllocationRepository.saveAll(allocations);
        if (coupon != null) {
            coupon.setUsedCount(coupon.getUsedCount() + 1);
            couponUsageRepository.save(CouponUsage.builder()
                    .coupon(coupon)
                    .user(customer)
                    .order(savedOrder)
                    .build());
        }
        orderStatusHistoryRepository.save(OrderStatusHistory.builder()
                .order(savedOrder)
                .status(OrderStatus.DELIVERED)
                .note("POS counter sale completed")
                .actorName("POS")
                .changedAt(LocalDateTime.now())
                .build());
        webSocketNotificationService.notifyOrderStatusUpdate(savedOrder, "POS order created", "POS_ORDER_CREATED");

        return toResponse(savedOrder);
    }

    @Transactional(readOnly = true)
    public AdminPosCashierSessionResponse getCurrentSession() {
        return cashierSessionRepository.findFirstByStatusOrderByOpenedAtDesc("OPEN")
                .map(this::toSessionResponse)
                .orElse(null);
    }

    @Transactional
    public AdminPosCashierSessionResponse openSession(AdminPosCashierSessionRequest request) {
        cashierSessionRepository.findFirstByStatusOrderByOpenedAtDesc("OPEN")
                .ifPresent(session -> {
                    throw new BadRequestException("A cashier session is already open");
                });

        CashierSession session = CashierSession.builder()
                .cashierName(normalize(request.getCashierName()) != null ? normalize(request.getCashierName()) : "POS cashier")
                .openedAt(LocalDateTime.now())
                .openingCash(normalizeMoney(request.getOpeningCash()))
                .status("OPEN")
                .note(normalize(request.getNote()))
                .build();
        return toSessionResponse(cashierSessionRepository.save(session));
    }

    @Transactional
    public AdminPosCashierSessionResponse closeSession(String id, AdminPosCashierSessionRequest request) {
        CashierSession session = cashierSessionRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Cashier session not found with id: " + id));
        if (!"OPEN".equals(session.getStatus())) {
            throw new BadRequestException("Cashier session is already closed");
        }

        session.setClosedAt(LocalDateTime.now());
        session.setClosingCash(normalizeMoney(request.getClosingCash()));
        session.setStatus("CLOSED");
        session.setNote(normalize(request.getNote()) != null ? normalize(request.getNote()) : session.getNote());
        return toSessionResponse(cashierSessionRepository.save(session));
    }

    @Transactional
    public AdminPosReturnExchangeResponse returnOrExchange(String orderId, AdminPosReturnExchangeRequest request) {
        Order order = orderRepository.findDetailedById(orderId)
                .orElseThrow(() -> new NotFoundException("POS order not found with id: " + orderId));
        ensurePosOrder(order);

        List<AdminPosReturnExchangeItemRequest> returnItems = request.getReturnItems() != null ? request.getReturnItems() : List.of();
        List<AdminPosOrderItemRequest> exchangeItems = request.getExchangeItems() != null ? mergeDuplicateItems(request.getExchangeItems()) : List.of();
        if (returnItems.isEmpty() && exchangeItems.isEmpty()) {
            throw new BadRequestException("Return or exchange items are required");
        }

        BigDecimal returnedAmount = processReturnItems(order, returnItems);
        BigDecimal exchangeAmount = processExchangeItems(order, exchangeItems);
        recalculateOrderTotalsAfterReturnExchange(order);

        BigDecimal balanceAmount = exchangeAmount.subtract(returnedAmount).setScale(2, RoundingMode.HALF_UP);
        PosReturnExchangeLog log = posReturnExchangeLogRepository.save(PosReturnExchangeLog.builder()
                .order(order)
                .type(exchangeItems.isEmpty() ? "RETURN" : "EXCHANGE")
                .returnedAmount(returnedAmount)
                .exchangeAmount(exchangeAmount)
                .balanceAmount(balanceAmount)
                .detailJson(buildReturnExchangeDetail(returnItems, exchangeItems))
                .note(normalize(request.getNote()))
                .build());

        if (balanceAmount.compareTo(BigDecimal.ZERO) > 0) {
            PaymentMethod paymentMethod = parsePaymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : "CASH");
            posPaymentAllocationRepository.save(PosPaymentAllocation.builder()
                    .order(order)
                    .method(paymentMethod)
                    .amount(balanceAmount)
                    .cashReceived(paymentMethod == PaymentMethod.COD ? balanceAmount : null)
                    .changeAmount(BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP))
                    .note("POS exchange collection")
                    .build());
        }

        orderStatusHistoryRepository.save(OrderStatusHistory.builder()
                .order(order)
                .status(order.getStatus())
                .note("POS " + (exchangeItems.isEmpty() ? "return" : "exchange") + " processed")
                .actorName("POS")
                .changedAt(LocalDateTime.now())
                .build());

        Order savedOrder = orderRepository.save(order);
        for (OrderItem item : savedOrder.getItems()) {
            item.setOrder(savedOrder);
            orderItemRepository.save(item);
        }
        return AdminPosReturnExchangeResponse.builder()
                .logId(log.getId())
                .type(log.getType())
                .returnedAmount(returnedAmount)
                .exchangeAmount(exchangeAmount)
                .refundAmount(balanceAmount.compareTo(BigDecimal.ZERO) < 0 ? balanceAmount.abs() : BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP))
                .collectAmount(balanceAmount.compareTo(BigDecimal.ZERO) > 0 ? balanceAmount : BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP))
                .order(toResponse(savedOrder))
                .build();
    }

    private PaymentMethod resolvePrimaryPaymentMethod(AdminPosCreateOrderRequest request) {
        List<AdminPosPaymentRequest> payments = request.getPayments() != null ? request.getPayments() : List.of();
        if (payments.size() > 1) {
            return PaymentMethod.MIXED;
        }
        if (payments.size() == 1) {
            return parsePaymentMethod(payments.get(0).getMethod());
        }
        return parsePaymentMethod(request.getPaymentMethod());
    }

    private List<PosPaymentAllocation> buildPaymentAllocations(AdminPosCreateOrderRequest request, Order order, BigDecimal finalPrice) {
        if (finalPrice.compareTo(BigDecimal.ZERO) == 0) {
            return List.of();
        }

        List<AdminPosPaymentRequest> paymentRequests = request.getPayments() != null && !request.getPayments().isEmpty()
                ? request.getPayments()
                : List.of(AdminPosPaymentRequest.builder()
                .method(request.getPaymentMethod())
                .amount(finalPrice)
                .cashReceived(request.getCashReceived())
                .build());

        BigDecimal totalPaid = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        List<PosPaymentAllocation> allocations = new ArrayList<>();
        for (AdminPosPaymentRequest paymentRequest : paymentRequests) {
            PaymentMethod method = parsePaymentMethod(paymentRequest.getMethod());
            BigDecimal amount = normalizeMoney(paymentRequest.getAmount());
            if (amount.compareTo(BigDecimal.ZERO) <= 0) {
                throw new BadRequestException("Payment amount must be greater than 0");
            }

            BigDecimal cashReceived = method == PaymentMethod.COD
                    ? normalizeMoney(paymentRequest.getCashReceived() != null ? paymentRequest.getCashReceived() : amount)
                    : null;
            if (method == PaymentMethod.COD && cashReceived.compareTo(amount) < 0) {
                throw new BadRequestException("Cash received cannot be less than cash payment amount");
            }
            BigDecimal changeAmount = method == PaymentMethod.COD
                    ? cashReceived.subtract(amount).setScale(2, RoundingMode.HALF_UP)
                    : BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);

            totalPaid = totalPaid.add(amount).setScale(2, RoundingMode.HALF_UP);
            allocations.add(PosPaymentAllocation.builder()
                    .order(order)
                    .method(method)
                    .amount(amount)
                    .cashReceived(cashReceived)
                    .changeAmount(changeAmount)
                    .referenceCode(normalize(paymentRequest.getReferenceCode()))
                    .note(normalize(paymentRequest.getNote()))
                    .build());
        }

        if (totalPaid.compareTo(finalPrice) != 0) {
            throw new BadRequestException("Total payment amount must equal final order amount");
        }
        return allocations;
    }

    private BigDecimal processReturnItems(Order order, List<AdminPosReturnExchangeItemRequest> returnItems) {
        BigDecimal returnedAmount = BigDecimal.ZERO;
        Map<String, OrderItem> itemMap = order.getItems().stream()
                .collect(Collectors.toMap(OrderItem::getId, Function.identity()));

        for (AdminPosReturnExchangeItemRequest returnItem : returnItems) {
            OrderItem orderItem = itemMap.get(returnItem.getOrderItemId());
            if (orderItem == null) {
                throw new BadRequestException("Order item does not belong to this POS order: " + returnItem.getOrderItemId());
            }
            int returnedQuantity = orderItem.getReturnedQuantity() != null ? orderItem.getReturnedQuantity() : 0;
            int availableQuantity = orderItem.getQuantity() - returnedQuantity;
            if (returnItem.getQuantity() > availableQuantity) {
                throw new BadRequestException("Return quantity exceeds available quantity for SKU " + orderItem.getSkuSnapshot());
            }

            orderItem.setReturnedQuantity(returnedQuantity + returnItem.getQuantity());
            restoreStock(orderItem.getVariant(), returnItem.getQuantity());
            returnedAmount = returnedAmount.add(orderItem.getUnitPrice().multiply(BigDecimal.valueOf(returnItem.getQuantity())));
        }
        return returnedAmount.setScale(2, RoundingMode.HALF_UP);
    }

    private BigDecimal processExchangeItems(Order order, List<AdminPosOrderItemRequest> exchangeItems) {
        BigDecimal exchangeAmount = BigDecimal.ZERO;
        for (AdminPosOrderItemRequest exchangeItem : exchangeItems) {
            Variant variant = variantRepository.findWithProductById(exchangeItem.getVariantId())
                    .orElseThrow(() -> new NotFoundException("Variant not found with id: " + exchangeItem.getVariantId()));
            validateVariantForSale(variant, exchangeItem.getQuantity());

            BigDecimal unitPrice = variant.getProduct().getBasePrice()
                    .add(variant.getAdditionalPrice() != null ? variant.getAdditionalPrice() : BigDecimal.ZERO)
                    .setScale(2, RoundingMode.HALF_UP);
            BigDecimal lineTotal = unitPrice.multiply(BigDecimal.valueOf(exchangeItem.getQuantity())).setScale(2, RoundingMode.HALF_UP);
            decrementStock(variant, exchangeItem.getQuantity());
            exchangeAmount = exchangeAmount.add(lineTotal);

            OrderItem existing = order.getItems().stream()
                    .filter(item -> item.getVariant().getId().equals(variant.getId()))
                    .findFirst()
                    .orElse(null);
            if (existing != null) {
                existing.setQuantity(existing.getQuantity() + exchangeItem.getQuantity());
                existing.setTotalPrice(existing.getUnitPrice().multiply(BigDecimal.valueOf(existing.getQuantity())).setScale(2, RoundingMode.HALF_UP));
            } else {
                order.getItems().add(OrderItem.builder()
                        .order(order)
                        .variant(variant)
                        .productName(variant.getProduct().getName())
                        .skuSnapshot(variant.getSku())
                        .sizeSnapshot(variant.getSize().getName())
                        .colorSnapshot(variant.getColor())
                        .quantity(exchangeItem.getQuantity())
                        .unitPrice(unitPrice)
                        .totalPrice(lineTotal)
                        .build());
            }
        }
        return exchangeAmount.setScale(2, RoundingMode.HALF_UP);
    }

    private void recalculateOrderTotalsAfterReturnExchange(Order order) {
        BigDecimal activeSubtotal = order.getItems().stream()
                .map(item -> {
                    int returnedQuantity = item.getReturnedQuantity() != null ? item.getReturnedQuantity() : 0;
                    int activeQuantity = Math.max(0, item.getQuantity() - returnedQuantity);
                    return item.getUnitPrice().multiply(BigDecimal.valueOf(activeQuantity));
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);
        BigDecimal discount = order.getDiscountAmount() != null ? order.getDiscountAmount().min(activeSubtotal) : BigDecimal.ZERO;

        order.setSubtotalAmount(activeSubtotal);
        order.setDiscountAmount(discount.setScale(2, RoundingMode.HALF_UP));
        order.setFinalPrice(activeSubtotal.subtract(discount).setScale(2, RoundingMode.HALF_UP));
        order.setStatus(activeSubtotal.compareTo(BigDecimal.ZERO) == 0 ? OrderStatus.RETURNED : OrderStatus.DELIVERED);
        if (order.getPayment() != null && activeSubtotal.compareTo(BigDecimal.ZERO) == 0) {
            order.getPayment().setStatus(PaymentStatus.REFUNDED);
        }
    }

    private void restoreStock(Variant variant, int quantity) {
        int variantStock = variant.getStockQuantity() != null ? variant.getStockQuantity() : 0;
        variant.setStockQuantity(variantStock + quantity);
        if (variant.getProduct() != null) {
            int productStock = variant.getProduct().getTotalQuantity() != null ? variant.getProduct().getTotalQuantity() : 0;
            variant.getProduct().setTotalQuantity(productStock + quantity);
        }
    }

    private void ensurePosOrder(Order order) {
        if (order.getPayment() == null || !"POS".equals(order.getPayment().getProvider())) {
            throw new NotFoundException("POS order not found with id: " + order.getId());
        }
    }

    private String buildReturnExchangeDetail(List<AdminPosReturnExchangeItemRequest> returnItems, List<AdminPosOrderItemRequest> exchangeItems) {
        String returns = returnItems.stream()
                .map(item -> "{\"orderItemId\":\"" + item.getOrderItemId() + "\",\"quantity\":" + item.getQuantity() + "}")
                .collect(Collectors.joining(","));
        String exchanges = exchangeItems.stream()
                .map(item -> "{\"variantId\":\"" + item.getVariantId() + "\",\"quantity\":" + item.getQuantity() + "}")
                .collect(Collectors.joining(","));
        return "{\"returns\":[" + returns + "],\"exchanges\":[" + exchanges + "]}";
    }

    private User resolveCustomer(AdminPosCreateOrderRequest request) {
        if (request.getCustomerId() != null) {
            return userRepository.findAdminUserById(request.getCustomerId(), RoleName.CUSTOMER)
                    .orElseThrow(() -> new NotFoundException("Customer not found with id: " + request.getCustomerId()));
        }

        if ("WALK_IN".equalsIgnoreCase(request.getCustomerType())) {
            return resolveWalkInCustomer();
        }

        String phone = normalize(request.getCustomerPhone());
        if (phone != null) {
            return userRepository.findByPhoneNumber(phone).orElseGet(() -> createCounterCustomer(request.getCustomerName(), phone));
        }
        return createCounterCustomer(request.getCustomerName(), null);
    }

    private User resolvePreviewCustomer(AdminPosCreateOrderRequest request) {
        if (request.getCustomerId() != null) {
            return userRepository.findAdminUserById(request.getCustomerId(), RoleName.CUSTOMER)
                    .orElseThrow(() -> new NotFoundException("Customer not found with id: " + request.getCustomerId()));
        }

        if ("WALK_IN".equalsIgnoreCase(request.getCustomerType())) {
            return userRepository.findByEmail("pos-walkin@local").orElse(null);
        }

        String phone = normalize(request.getCustomerPhone());
        if (phone != null) {
            return userRepository.findByPhoneNumber(phone).orElse(null);
        }
        return null;
    }

    private User resolveWalkInCustomer() {
        return userRepository.findByEmail("pos-walkin@local")
                .orElseGet(() -> {
                    Role customerRole = roleRepository.findByName(RoleName.CUSTOMER)
                            .orElseThrow(() -> new IllegalStateException("CUSTOMER role not found"));
                    return userRepository.save(User.builder()
                            .fullName("Khach le tai quay")
                            .email("pos-walkin@local")
                            .phoneNumber("POS-WALKIN")
                            .password(passwordEncoder.encode(UUID.randomUUID().toString()))
                            .status(UserStatus.ACTIVE)
                            .roles(Set.of(customerRole))
                            .build());
                });
    }

    private User createCounterCustomer(String customerName, String phone) {
        Role customerRole = roleRepository.findByName(RoleName.CUSTOMER)
                .orElseThrow(() -> new IllegalStateException("CUSTOMER role not found"));
        String uniqueSuffix = DateTimeFormatter.ofPattern("yyyyMMddHHmmssSSS").format(LocalDateTime.now());
        String resolvedPhone = phone != null ? phone : "POS" + uniqueSuffix;
        String resolvedName = normalize(customerName) != null ? normalize(customerName) : "Khach tai quay " + uniqueSuffix;

        return userRepository.save(User.builder()
                .fullName(resolvedName + " #" + uniqueSuffix)
                .email("pos-" + uniqueSuffix + "@walkin.local")
                .phoneNumber(resolvedPhone)
                .password(passwordEncoder.encode(UUID.randomUUID().toString()))
                .status(UserStatus.ACTIVE)
                .roles(Set.of(customerRole))
                .build());
    }

    private List<AdminPosOrderItemRequest> mergeDuplicateItems(List<AdminPosOrderItemRequest> items) {
        List<AdminPosOrderItemRequest> merged = new ArrayList<>();
        if (items == null) {
            return merged;
        }
        for (AdminPosOrderItemRequest item : items) {
            if (item.getVariantId() == null || item.getQuantity() == null || item.getQuantity() <= 0) {
                continue;
            }
            AdminPosOrderItemRequest existing = merged.stream()
                    .filter(candidate -> candidate.getVariantId().equals(item.getVariantId()))
                    .findFirst()
                    .orElse(null);
            if (existing == null) {
                merged.add(AdminPosOrderItemRequest.builder()
                        .variantId(item.getVariantId())
                        .quantity(item.getQuantity())
                        .build());
            } else {
                existing.setQuantity(existing.getQuantity() + item.getQuantity());
            }
        }
        return merged;
    }

    private BigDecimal calculatePosSubtotal(List<AdminPosOrderItemRequest> requestItems) {
        BigDecimal subtotal = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        List<AdminPosOrderItemRequest> items = mergeDuplicateItems(requestItems);
        if (items.isEmpty()) {
            throw new BadRequestException("Order items are required");
        }

        for (AdminPosOrderItemRequest item : items) {
            Variant variant = variantRepository.findReadOnlyWithProductById(item.getVariantId())
                    .orElseThrow(() -> new NotFoundException("Variant not found with id: " + item.getVariantId()));
            validateVariantForSale(variant, item.getQuantity());
            BigDecimal unitPrice = variant.getProduct().getBasePrice()
                    .add(variant.getAdditionalPrice() != null ? variant.getAdditionalPrice() : BigDecimal.ZERO)
                    .setScale(2, RoundingMode.HALF_UP);
            subtotal = subtotal.add(unitPrice.multiply(BigDecimal.valueOf(item.getQuantity()))).setScale(2, RoundingMode.HALF_UP);
        }
        return subtotal;
    }

    private void validateVariantForSale(Variant variant, Integer quantity) {
        if (variant.getStatus() != VariantStatus.ACTIVE) {
            throw new BadRequestException("Variant is not available for sale: " + variant.getSku());
        }
        int stock = variant.getStockQuantity() != null ? variant.getStockQuantity() : 0;
        if (stock < quantity) {
            throw new BadRequestException("Insufficient stock for SKU " + variant.getSku() + ". Available: " + stock);
        }
    }

    private void decrementStock(Variant variant, int quantity) {
        int variantStock = variant.getStockQuantity() != null ? variant.getStockQuantity() : 0;
        variant.setStockQuantity(variantStock - quantity);
        if (variant.getProduct() != null && variant.getProduct().getTotalQuantity() != null) {
            variant.getProduct().setTotalQuantity(Math.max(0, variant.getProduct().getTotalQuantity() - quantity));
        }
    }

    private PaymentMethod parsePaymentMethod(String value) {
        if (value == null || value.isBlank()) {
            throw new BadRequestException("Payment method is required");
        }
        return switch (value.trim().toUpperCase()) {
            case "CASH", "COD" -> PaymentMethod.COD;
            case "BANK_TRANSFER", "TRANSFER", "QR" -> PaymentMethod.BANK_TRANSFER;
            case "CARD", "CREDIT_CARD" -> PaymentMethod.CREDIT_CARD;
            case "E_WALLET", "MOMO", "VNPAY" -> PaymentMethod.E_WALLET;
            case "MIXED" -> PaymentMethod.MIXED;
            default -> throw new BadRequestException("Invalid POS payment method: " + value);
        };
    }

    private BigDecimal normalizeMoney(BigDecimal value) {
        return (value == null ? BigDecimal.ZERO : value).setScale(2, RoundingMode.HALF_UP);
    }

    private String normalize(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }

    private String generatePosOrderCode() {
        return "POS" + DateTimeFormatter.ofPattern("yyyyMMddHHmmssSSS").format(LocalDateTime.now());
    }

    private Variant findVariantByCode(String code) {
        String normalizedCode = stripQrPrefix(code);
        String productIdValue = extractProductIdCode(normalizedCode);
        if (productIdValue != null) {
            return variantRepository.findFirstByProductIdAndStatusOrderByIdAsc(productIdValue, VariantStatus.ACTIVE)
                    .orElseThrow(() -> new NotFoundException("Active variant not found for product QR code: " + productIdValue));
        }

        var variantBySku = variantRepository.findBySkuIgnoreCase(normalizedCode);
        if (variantBySku.isPresent()) {
            return variantBySku.get();
        }

        var variantById = variantRepository.findReadOnlyWithProductById(normalizedCode);
        if (variantById.isPresent()) {
            return variantById.get();
        }

        throw new NotFoundException("Variant not found for QR code: " + normalizedCode);
    }

    private String extractProductIdCode(String code) {
        String normalized = stripWrappingQuotes(code);
        if (normalized == null) {
            return null;
        }
        String lower = normalized.toLowerCase();
        for (String prefix : List.of("product:", "product=", "product_id:", "product_id=", "productid:", "productid=")) {
            if (lower.startsWith(prefix)) {
                return normalized.substring(prefix.length()).trim();
            }
        }
        return null;
    }

    private String normalizeQrCode(String code) {
        String normalized = normalize(code);
        if (normalized == null) {
            throw new BadRequestException("QR code is required");
        }
        normalized = stripWrappingQuotes(normalized);

        String jsonCode = extractJsonQrCode(normalized);
        if (jsonCode != null) {
            return stripQrPrefix(jsonCode);
        }

        String urlCode = extractUrlQrCode(normalized);
        if (urlCode != null) {
            return stripQrPrefix(urlCode);
        }

        return stripQrPrefix(normalized);
    }

    private String stripQrPrefix(String value) {
        String result = stripWrappingQuotes(value);
        if (result == null || result.isBlank()) {
            throw new BadRequestException("QR code is required");
        }

        boolean changed;
        do {
            changed = false;
            String lower = result.toLowerCase();
            if (lower.startsWith("qr:")) {
                result = result.substring(3).trim();
                changed = true;
                continue;
            }
            for (String prefix : List.of("sku:", "sku=", "variant:", "variant=", "variant_id:", "variant_id=", "variantid:", "variantid=", "code:", "code=", "id:", "id=")) {
                if (lower.startsWith(prefix)) {
                    result = result.substring(prefix.length()).trim();
                    changed = true;
                    break;
                }
            }
        } while (changed);

        return result;
    }

    private String stripWrappingQuotes(String value) {
        String result = normalize(value);
        if (result == null) {
            return null;
        }
        while (result.length() >= 2 && ((result.startsWith("\"") && result.endsWith("\"")) || (result.startsWith("'") && result.endsWith("'")))) {
            result = result.substring(1, result.length() - 1).trim();
        }
        return result;
    }

    private String extractJsonQrCode(String value) {
        if (!value.startsWith("{") && !value.startsWith("[")) {
            return null;
        }
        try {
            return findJsonQrCode(QR_OBJECT_MAPPER.readTree(value));
        } catch (Exception ignored) {
            return null;
        }
    }

    private String findJsonQrCode(JsonNode node) {
        if (node == null || node.isNull()) {
            return null;
        }
        if (node.isObject()) {
            var directFields = node.fields();
            while (directFields.hasNext()) {
                Map.Entry<String, JsonNode> field = directFields.next();
                if (PRODUCT_QR_CODE_KEYS.stream().anyMatch(key -> key.equalsIgnoreCase(field.getKey()))
                        && field.getValue() != null
                        && !field.getValue().isNull()
                        && !field.getValue().asText().isBlank()) {
                    return "PRODUCT:" + field.getValue().asText().trim();
                }
                if (QR_CODE_KEYS.stream().anyMatch(key -> key.equalsIgnoreCase(field.getKey()))
                        && field.getValue() != null
                        && !field.getValue().isNull()
                        && !field.getValue().asText().isBlank()) {
                    return field.getValue().asText().trim();
                }
            }
            var fields = node.fields();
            while (fields.hasNext()) {
                String nestedCode = findJsonQrCode(fields.next().getValue());
                if (nestedCode != null) {
                    return nestedCode;
                }
            }
        }
        if (node.isArray()) {
            for (JsonNode item : node) {
                String nestedCode = findJsonQrCode(item);
                if (nestedCode != null) {
                    return nestedCode;
                }
            }
        }
        return null;
    }

    private String extractUrlQrCode(String value) {
        try {
            URI uri = URI.create(value);
            if (uri.getScheme() == null) {
                return null;
            }
            String queryCode = extractCodeFromQuery(uri.getRawQuery());
            if (queryCode != null) {
                return queryCode;
            }
            String fragmentCode = extractCodeFromQuery(uri.getRawFragment());
            if (fragmentCode != null) {
                return fragmentCode;
            }
            String path = uri.getRawPath();
            if (path != null && !path.isBlank()) {
                String[] segments = path.split("/");
                for (int index = segments.length - 1; index >= 0; index--) {
                    if (!segments[index].isBlank()) {
                        return URLDecoder.decode(segments[index], StandardCharsets.UTF_8);
                    }
                }
            }
        } catch (IllegalArgumentException ignored) {
            return null;
        }
        return null;
    }

    private String extractCodeFromQuery(String rawQuery) {
        if (rawQuery == null || rawQuery.isBlank()) {
            return null;
        }
        String query = rawQuery.startsWith("#") ? rawQuery.substring(1) : rawQuery;
        for (String part : query.split("&")) {
            String[] pair = part.split("=", 2);
            if (pair.length != 2) {
                continue;
            }
            String key = URLDecoder.decode(pair[0], StandardCharsets.UTF_8);
            String value = URLDecoder.decode(pair[1], StandardCharsets.UTF_8);
            if (PRODUCT_QR_CODE_KEYS.stream().anyMatch(candidate -> candidate.equalsIgnoreCase(key)) && !value.isBlank()) {
                return "PRODUCT:" + value.trim();
            }
            if (QR_CODE_KEYS.stream().anyMatch(candidate -> candidate.equalsIgnoreCase(key)) && !value.isBlank()) {
                return value.trim();
            }
        }
        return null;
    }

    private AdminPosOrderResponse toResponse(Order order) {
        List<PosPaymentAllocation> allocations = order.getId() != null
                ? posPaymentAllocationRepository.findByOrderId(order.getId())
                : List.of();
        BigDecimal cashReceived = allocations.stream()
                .map(allocation -> allocation.getCashReceived() != null ? allocation.getCashReceived() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);
        BigDecimal changeAmount = allocations.stream()
                .map(allocation -> allocation.getChangeAmount() != null ? allocation.getChangeAmount() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);

        return AdminPosOrderResponse.builder()
                .orderId(order.getId())
                .orderCode(order.getOrderCode())
                .customerName(order.getUser().getFullName())
                .customerPhone(order.getUser().getPhoneNumber())
                .status(order.getStatus().name())
                .paymentStatus(order.getPayment().getStatus().name())
                .paymentMethod(order.getPayment().getMethod().name())
                .couponCode(order.getCoupon() != null ? order.getCoupon().getCode() : null)
                .subtotalAmount(order.getSubtotalAmount())
                .discountAmount(order.getDiscountAmount())
                .finalPrice(order.getFinalPrice())
                .cashReceived(cashReceived)
                .changeAmount(changeAmount)
                .qrPaymentPayload(buildQrPaymentPayload(order))
                .createdAt(order.getCreatedAt())
                .payments(allocations.stream()
                        .map(allocation -> AdminPosPaymentResponse.builder()
                                .method(allocation.getMethod().name())
                                .amount(allocation.getAmount())
                                .cashReceived(allocation.getCashReceived())
                                .changeAmount(allocation.getChangeAmount())
                                .referenceCode(allocation.getReferenceCode())
                                .note(allocation.getNote())
                                .build())
                        .toList())
                .items(order.getItems().stream()
                        .map(item -> AdminPosOrderItemResponse.builder()
                                .orderItemId(item.getId())
                                .variantId(item.getVariant().getId())
                                .productName(item.getProductName())
                                .sku(item.getSkuSnapshot())
                                .size(item.getSizeSnapshot())
                                .color(item.getColorSnapshot())
                                .quantity(item.getQuantity())
                                .returnedQuantity(item.getReturnedQuantity() != null ? item.getReturnedQuantity() : 0)
                                .availableReturnQuantity(item.getQuantity() - (item.getReturnedQuantity() != null ? item.getReturnedQuantity() : 0))
                                .unitPrice(item.getUnitPrice())
                                .totalPrice(item.getTotalPrice())
                                .build())
                        .toList())
                .build();
    }

    private AdminPosCashierSessionResponse toSessionResponse(CashierSession session) {
        LocalDateTime to = session.getClosedAt() != null ? session.getClosedAt() : LocalDateTime.now();
        BigDecimal cashSales = posPaymentAllocationRepository.sumCashAmountBetween(session.getOpenedAt(), to).setScale(2, RoundingMode.HALF_UP);
        BigDecimal expectedCash = session.getOpeningCash().add(cashSales).setScale(2, RoundingMode.HALF_UP);
        BigDecimal cashDifference = session.getClosingCash() != null
                ? session.getClosingCash().subtract(expectedCash).setScale(2, RoundingMode.HALF_UP)
                : null;
        return AdminPosCashierSessionResponse.builder()
                .id(session.getId())
                .cashierName(session.getCashierName())
                .status(session.getStatus())
                .openedAt(session.getOpenedAt())
                .closedAt(session.getClosedAt())
                .openingCash(session.getOpeningCash())
                .cashSales(cashSales)
                .expectedCash(expectedCash)
                .closingCash(session.getClosingCash())
                .cashDifference(cashDifference)
                .note(session.getNote())
                .build();
    }

    private String buildQrPaymentPayload(Order order) {
        return "POS|" + order.getOrderCode() + "|" + order.getFinalPrice().setScale(0, RoundingMode.HALF_UP);
    }
}
