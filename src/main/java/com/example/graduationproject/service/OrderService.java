package com.example.graduationproject.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Stream;

import com.example.graduationproject.entity.Address;
import com.example.graduationproject.entity.CartItem;
import com.example.graduationproject.entity.Coupon;
import com.example.graduationproject.entity.CouponUsage;
import com.example.graduationproject.entity.Order;
import com.example.graduationproject.entity.OrderItem;
import com.example.graduationproject.entity.OrderStatusHistory;
import com.example.graduationproject.entity.Payment;
import com.example.graduationproject.entity.Promotion;
import com.example.graduationproject.entity.Shipping;
import com.example.graduationproject.entity.User;
import com.example.graduationproject.entity.Variant;
import com.example.graduationproject.entity.enums.OrderStatus;
import com.example.graduationproject.entity.enums.PaymentMethod;
import com.example.graduationproject.entity.enums.PaymentStatus;
import com.example.graduationproject.entity.enums.PromotionStatus;
import com.example.graduationproject.entity.enums.ShippingMethod;
import com.example.graduationproject.entity.enums.ShippingStatus;
import com.example.graduationproject.exception.BadRequestException;
import com.example.graduationproject.exception.NotFoundException;
import com.example.graduationproject.payment.config.VnpayProperties;
import com.example.graduationproject.payment.repository.AddressRepository;
import com.example.graduationproject.payment.repository.CouponRepository;
import com.example.graduationproject.payment.repository.CouponUsageRepository;
import com.example.graduationproject.payment.repository.OrderRepository;
import com.example.graduationproject.payment.repository.OrderStatusHistoryRepository;
import com.example.graduationproject.payment.repository.PromotionRepository;
import com.example.graduationproject.payment.repository.UserRepository;
import com.example.graduationproject.payment.repository.VariantRepository;
import com.example.graduationproject.payment.repository.PaymentRepository;
import com.example.graduationproject.payment.repository.ShippingRepository;
import com.example.graduationproject.service.coupon.CouponService;
import com.example.graduationproject.service.dto.OrderDetailResponse;
import com.example.graduationproject.service.dto.OrderItemDetailResponse;
import com.example.graduationproject.service.dto.OrderItemRequest;
import com.example.graduationproject.service.dto.OrderPricingItemResponse;
import com.example.graduationproject.service.dto.OrderPricingResult;
import com.example.graduationproject.service.dto.OrderRequest;
import com.example.graduationproject.service.dto.OrderResponse;
import com.example.graduationproject.service.dto.OrderListResponse;
import com.example.graduationproject.service.dto.ReturnOrderRequest;
import com.example.graduationproject.entity.enums.CartStatus;
import com.example.graduationproject.payment.repository.CartItemRepository;
import com.example.graduationproject.payment.repository.CartRepository;
import com.example.graduationproject.payment.repository.OrderItemRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {

    private static final BigDecimal SHIPPING_FEE = BigDecimal.valueOf(30000).setScale(2, RoundingMode.HALF_UP);
    private static final BigDecimal ONE_HUNDRED = BigDecimal.valueOf(100);

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final VariantRepository variantRepository;
    private final PromotionRepository promotionRepository;
    private final AddressRepository addressRepository;
    private final CouponUsageRepository couponUsageRepository;
    private final CouponRepository couponRepository;
    private final OrderStatusHistoryRepository orderStatusHistoryRepository;
    private final CouponService couponService;
    private final VnpayProperties vnpayProperties;
    private final CartRepository cartRepository;
    private final WebSocketNotificationService webSocketNotificationService;
    private final PaymentRepository paymentRepository;
    private final ShippingRepository shippingRepository;

    @Transactional
    public OrderResponse createOrder(OrderRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new NotFoundException("User not found"));
        Address address;
        if (request.getAddressId() != null) {
            address = addressRepository.findByIdAndUserId(request.getAddressId(), request.getUserId())
                    .orElseGet(() -> addressRepository.findFirstByUserIdOrderByCreatedAtDesc(request.getUserId())
                            .orElseGet(() -> createAddressFromRequest(user, request)));
        } else {
            address = addressRepository.findFirstByUserIdOrderByCreatedAtDesc(request.getUserId())
                    .orElseGet(() -> createAddressFromRequest(user, request));
        }

        List<OrderLine> orderLines = buildOrderLinesForWrite(request.getItems());
        OrderPricingResult pricingResult = calculatePricing(user, orderLines, request.getCouponCode());
        BigDecimal appliedShippingFee = request.getShippingFee() != null ? request.getShippingFee() : SHIPPING_FEE;
        BigDecimal finalPrice = pricingResult.getFinalPrice().add(appliedShippingFee).setScale(2, RoundingMode.HALF_UP);

        Order order = Order.builder()
                .orderCode(generateOrderCode(user.getId()))
                .user(user)
                .coupon(pricingResult.getAppliedCoupon())
                .status(OrderStatus.PENDING)
                .subtotalAmount(pricingResult.getSubtotal())
                .discountAmount(pricingResult.getPromotionDiscount().add(pricingResult.getCouponDiscount()).setScale(2, RoundingMode.HALF_UP))
                .shippingFee(appliedShippingFee)
                .finalPrice(finalPrice)
                .note(request.getNote() != null ? request.getNote() : "Order created from API /api/orders")
                .build();

        for (OrderLine line : orderLines) {
            Variant variant = line.variant();
            int variantStock = variant.getStockQuantity() != null ? variant.getStockQuantity() : 0;
            variant.setStockQuantity(Math.max(0, variantStock - line.quantity()));
            if (variant.getProduct() != null && variant.getProduct().getTotalQuantity() != null) {
                int productStock = variant.getProduct().getTotalQuantity();
                variant.getProduct().setTotalQuantity(Math.max(0, productStock - line.quantity()));
            }

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .variant(variant)
                    .productName(variant.getProduct().getName())
                    .skuSnapshot(variant.getSku())
                    .sizeSnapshot(variant.getSize().getName())
                    .colorSnapshot(variant.getColor())
                    .quantity(line.quantity())
                    .unitPrice(line.finalUnitPrice())
                    .totalPrice(line.finalLineTotal())
                    .build();
            order.getItems().add(orderItem);
        }

        Shipping shipping = Shipping.builder()
                .order(order)
                .user(user)
                .recipientName(address.getRecipientName())
                .phoneNumber(address.getPhoneNumber())
                .addressLine(address.getAddressLine())
                .ward(address.getWard())
                .district(address.getDistrict())
                .city(address.getCity())
                .country(address.getCountry())
                .postalCode(address.getPostalCode())
                .method(ShippingMethod.STANDARD)
                .status(ShippingStatus.PENDING)
                .shippingFee(appliedShippingFee)
                .note("Shipping address loaded from addressId=" + address.getId())
                .build();
        order.setShipping(shipping);

        PaymentMethod method = PaymentMethod.COD;
        String provider = null;
        if ("VNPAY".equalsIgnoreCase(request.getPaymentMethod())) {
            method = PaymentMethod.BANK_TRANSFER;
            provider = "VNPAY";
        } else if ("MOMO".equalsIgnoreCase(request.getPaymentMethod())) {
            method = PaymentMethod.E_WALLET;
            provider = "MOMO";
        }

        Payment payment = Payment.builder()
                .order(order)
                .user(user)
                .method(method)
                .provider(provider)
                .transactionCode(java.util.UUID.randomUUID().toString())
                .status(PaymentStatus.PENDING)
                .amount(finalPrice)
                .note("Payment pending")
                .build();
        order.setPayment(payment);

        Order savedOrder = orderRepository.save(order);

        // Save order items
        for (OrderItem item : order.getItems()) {
            item.setOrder(savedOrder);
            orderItemRepository.save(item);
        }

        // Save shipping
        shipping.setOrder(savedOrder);
        Shipping savedShipping = shippingRepository.save(shipping);
        savedOrder.setShipping(savedShipping);

        // Save payment
        payment.setOrder(savedOrder);
        Payment savedPayment = paymentRepository.save(payment);
        savedOrder.setPayment(savedPayment);

        // Save order again to link saved shipping and payment
        savedOrder = orderRepository.save(savedOrder);

        orderStatusHistoryRepository.save(OrderStatusHistory.builder()
                .order(savedOrder)
                .status(OrderStatus.PENDING)
                .note("Order created")
                .changedAt(LocalDateTime.now())
                .build());

        if (pricingResult.getAppliedCoupon() != null) {
            Coupon coupon = pricingResult.getAppliedCoupon();
            coupon.setUsedCount(coupon.getUsedCount() + 1);
            couponUsageRepository.save(CouponUsage.builder()
                    .coupon(coupon)
                    .user(user)
                    .order(savedOrder)
                    .build());
        }

        log.info("Created order {} for user {} with subtotal={}, promotionDiscount={}, couponDiscount={}, shippingFee={}, finalPrice={}",
                savedOrder.getOrderCode(), user.getId(), pricingResult.getSubtotal(), pricingResult.getPromotionDiscount(), pricingResult.getCouponDiscount(), SHIPPING_FEE, finalPrice);

        // Clear ordered items from the active cart
        final Order finalSavedOrder = savedOrder;
        cartRepository.findByUserIdAndStatus(user.getId(), CartStatus.ACTIVE)
                .ifPresent(cart -> {
                    List<String> orderedVariantIds = request.getItems().stream()
                            .map(OrderItemRequest::getVariantId)
                            .toList();
                    
                    // Explicitly delete from database
                    cart.getItems().forEach(item -> {
                        if (item.getVariant() != null && orderedVariantIds.contains(item.getVariant().getId())) {
                            cartItemRepository.delete(item);
                        }
                    });
                    
                    cart.getItems().removeIf(item -> item.getVariant() != null && orderedVariantIds.contains(item.getVariant().getId()));
                    
                    // Recalculate cart total
                    BigDecimal newTotal = cart.getItems().stream()
                            .map(item -> item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                    cart.setTotalPrice(newTotal);
                    cartRepository.save(cart);
                    log.info("Cleared {} ordered items from cart for user {}", orderedVariantIds.size(), user.getId());
                });
        webSocketNotificationService.notifyOrderStatusUpdate(
                savedOrder,
                "Đơn hàng mới đang chờ admin xác nhận",
                "ORDER_CREATED"
        );

        return OrderResponse.builder()
                .orderId(savedOrder.getId())
                .orderCode(savedOrder.getOrderCode())
                .subtotal(pricingResult.getSubtotal())
                .promotionDiscount(pricingResult.getPromotionDiscount())
                .couponDiscount(pricingResult.getCouponDiscount())
                .shippingFee(SHIPPING_FEE)
                .finalPrice(finalPrice)
                .build();
    }

    @Transactional(readOnly = true)
    public OrderPricingResult previewOrder(OrderRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new NotFoundException("User not found"));

        List<OrderLine> orderLines = buildOrderLinesReadOnly(request.getItems());
        return calculatePricingReadOnly(user, orderLines, request.getCouponCode());
    }

    @Transactional(readOnly = true)
    public OrderDetailResponse getOrderDetail(String id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Order not found with id: " + id));

        return OrderDetailResponse.builder()
                .orderId(order.getId())
                .orderCode(order.getOrderCode())
                .createdAt(order.getCreatedAt())
                .status(order.getStatus() != null ? order.getStatus().name() : null)
                .subtotal(order.getSubtotalAmount())
                .shippingFee(order.getShippingFee())
                .discount(order.getDiscountAmount())
                .promotionDiscount(calculatePromotionDiscountFromOrder(order))
                .couponDiscount(calculateCouponDiscountFromOrder(order))
                .finalPrice(order.getFinalPrice())
                .couponCode(order.getCoupon() != null ? order.getCoupon().getCode() : null)
                .note(order.getNote())
                .customerName(order.getUser() != null ? order.getUser().getFullName() : null)
                .customerEmail(order.getUser() != null ? order.getUser().getEmail() : null)
                .customerPhone(order.getUser() != null ? order.getUser().getPhoneNumber() : null)
                .recipientName(order.getShipping() != null ? order.getShipping().getRecipientName() : null)
                .recipientPhone(order.getShipping() != null ? order.getShipping().getPhoneNumber() : null)
                .shippingAddress(resolveShippingAddress(order))
                .shippingMethod(order.getShipping() != null && order.getShipping().getMethod() != null ? order.getShipping().getMethod().name() : null)
                .shippingStatus(order.getShipping() != null && order.getShipping().getStatus() != null ? order.getShipping().getStatus().name() : null)
                .paymentMethod(order.getPayment() != null && order.getPayment().getMethod() != null ? order.getPayment().getMethod().name() : null)
                .paymentStatus(order.getPayment() != null && order.getPayment().getStatus() != null ? order.getPayment().getStatus().name() : null)
                .paymentAmount(order.getPayment() != null ? order.getPayment().getAmount() : null)
                .items(order.getItems().stream()
                        .map(item -> {
                            int returnedQuantity = item.getReturnedQuantity() != null ? item.getReturnedQuantity() : 0;
                            int remainingQuantity = Math.max(0, (item.getQuantity() != null ? item.getQuantity() : 0) - returnedQuantity);
                            BigDecimal unitPrice = item.getUnitPrice() != null ? item.getUnitPrice() : BigDecimal.ZERO;
                            BigDecimal remainingTotalPrice = unitPrice
                                    .multiply(BigDecimal.valueOf(remainingQuantity))
                                    .setScale(2, RoundingMode.HALF_UP);
                            return OrderItemDetailResponse.builder()
                                    .id(item.getId())
                                    .productName(item.getProductName())
                                    .sku(item.getSkuSnapshot())
                                    .size(item.getSizeSnapshot())
                                    .color(item.getColorSnapshot())
                                    .quantity(item.getQuantity())
                                    .returnedQuantity(returnedQuantity)
                                    .requestedReturnQuantity(item.getRequestedReturnQuantity() != null ? item.getRequestedReturnQuantity() : 0)
                                    .remainingQuantity(remainingQuantity)
                                    .unitPrice(unitPrice)
                                    .totalPrice(item.getTotalPrice())
                                    .remainingTotalPrice(remainingTotalPrice)
                                    .imageUrl(item.getVariant() != null ? item.getVariant().getImageUrl() : null)
                                    .build();
                        })
                        .toList())
                .build();
    }

    private String resolveShippingAddress(Order order) {
        if (order.getShipping() == null) {
            return null;
        }
        return Stream.of(
                        order.getShipping().getAddressLine(),
                        order.getShipping().getWard(),
                        order.getShipping().getDistrict(),
                        order.getShipping().getCity(),
                        order.getShipping().getCountry()
                )
                .filter(value -> value != null && !value.isBlank())
                .reduce((left, right) -> left + ", " + right)
                .orElse(null);
    }

    private BigDecimal calculatePromotionDiscountFromOrder(Order order) {
        return order.getItems().stream()
                .map(item -> {
                    int remainingQuantity = Math.max(0, (item.getQuantity() != null ? item.getQuantity() : 0) - (item.getReturnedQuantity() != null ? item.getReturnedQuantity() : 0));
                    if (remainingQuantity <= 0) {
                        return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
                    }
                    BigDecimal basePrice = Optional.ofNullable(item.getVariant())
                            .map(Variant::getProduct)
                            .map(product -> product.getBasePrice())
                            .orElse(item.getUnitPrice() != null ? item.getUnitPrice() : BigDecimal.ZERO);
                    BigDecimal additionalPrice = Optional.ofNullable(item.getVariant())
                            .map(Variant::getAdditionalPrice)
                            .orElse(BigDecimal.ZERO);
                    BigDecimal baseLineTotal = basePrice
                            .add(additionalPrice)
                            .multiply(BigDecimal.valueOf(remainingQuantity))
                            .setScale(2, RoundingMode.HALF_UP);
                    BigDecimal remainingTotalPrice = item.getUnitPrice()
                            .multiply(BigDecimal.valueOf(remainingQuantity))
                            .setScale(2, RoundingMode.HALF_UP);
                    return baseLineTotal.subtract(remainingTotalPrice).max(BigDecimal.ZERO).setScale(2, RoundingMode.HALF_UP);
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);
    }

    private BigDecimal calculateCouponDiscountFromOrder(Order order) {
        BigDecimal promotionDiscount = calculatePromotionDiscountFromOrder(order);
        BigDecimal totalDiscount = order.getDiscountAmount() != null ? order.getDiscountAmount() : BigDecimal.ZERO;
        return totalDiscount.subtract(promotionDiscount).max(BigDecimal.ZERO).setScale(2, RoundingMode.HALF_UP);
    }

    @Transactional(readOnly = true)
    public OrderPricingResult calculateCartPricing(User user, List<CartItem> cartItems, String couponCode) {
        List<OrderLine> orderLines = cartItems.stream()
                .map(item -> {
                    Variant variant = item.getVariant();
                    BigDecimal baseUnitPrice = variant.getProduct().getBasePrice().add(variant.getAdditionalPrice()).setScale(2, RoundingMode.HALF_UP);
                    BigDecimal promotionDiscountPerUnit = applyPromotion(variant, baseUnitPrice);
                    BigDecimal finalUnitPrice = baseUnitPrice.subtract(promotionDiscountPerUnit).max(BigDecimal.ZERO).setScale(2, RoundingMode.HALF_UP);
                    BigDecimal quantity = BigDecimal.valueOf(item.getQuantity());
                    return new OrderLine(
                            variant,
                            item.getQuantity(),
                            baseUnitPrice.multiply(quantity).setScale(2, RoundingMode.HALF_UP),
                            promotionDiscountPerUnit.multiply(quantity).setScale(2, RoundingMode.HALF_UP),
                            finalUnitPrice,
                            finalUnitPrice.multiply(quantity).setScale(2, RoundingMode.HALF_UP)
                    );
                })
                .toList();

        return calculatePricingReadOnly(user, orderLines, couponCode);
    }

    public BigDecimal calculateTotal(List<OrderLine> orderLines, java.util.function.Function<OrderLine, BigDecimal> extractor) {
        return orderLines.stream()
                .map(extractor)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);
    }

    public BigDecimal applyPromotion(Variant variant, BigDecimal baseUnitPrice) {
        return promotionRepository.findActivePromotions(
                        variant.getProduct().getId(),
                        null,
                        PromotionStatus.ACTIVE,
                        LocalDateTime.now()
                ).stream()
                .map(promotion -> calculatePromotionDiscount(baseUnitPrice, promotion))
                .max(Comparator.naturalOrder())
                .orElse(BigDecimal.ZERO)
                .setScale(2, RoundingMode.HALF_UP);
    }

    public BigDecimal applyCoupon(Coupon coupon, BigDecimal priceAfterPromotion) {
        return couponService.calculateDiscount(coupon, priceAfterPromotion);
    }

    private OrderPricingResult calculatePricing(User user, List<OrderLine> orderLines, String couponCode) {
        BigDecimal subtotal = calculateTotal(orderLines, OrderLine::baseLineTotal);
        BigDecimal promotionDiscount = calculateTotal(orderLines, OrderLine::promotionDiscount);
        BigDecimal priceAfterPromotion = subtotal.subtract(promotionDiscount).setScale(2, RoundingMode.HALF_UP);
        Coupon coupon = couponService.validateCoupon(couponCode, user, priceAfterPromotion);
        BigDecimal couponDiscount = applyCoupon(coupon, priceAfterPromotion);
        BigDecimal finalPrice = priceAfterPromotion.subtract(couponDiscount).max(BigDecimal.ZERO).setScale(2, RoundingMode.HALF_UP);

        return OrderPricingResult.builder()
                .subtotal(subtotal)
                .promotionDiscount(promotionDiscount)
                .couponDiscount(couponDiscount)
                .finalPrice(finalPrice)
                .couponCode(coupon != null ? coupon.getCode() : null)
                .appliedCoupon(coupon)
                .items(orderLines.stream().map(this::toPricingItem).toList())
                .build();
    }

    private OrderPricingResult calculatePricingReadOnly(User user, List<OrderLine> orderLines, String couponCode) {
        BigDecimal subtotal = calculateTotal(orderLines, OrderLine::baseLineTotal);
        BigDecimal promotionDiscount = calculateTotal(orderLines, OrderLine::promotionDiscount);
        BigDecimal priceAfterPromotion = subtotal.subtract(promotionDiscount).setScale(2, RoundingMode.HALF_UP);
        Coupon coupon = couponService.validateCouponReadOnly(couponCode, user, priceAfterPromotion);
        BigDecimal couponDiscount = applyCoupon(coupon, priceAfterPromotion);
        BigDecimal finalPrice = priceAfterPromotion.subtract(couponDiscount).max(BigDecimal.ZERO).setScale(2, RoundingMode.HALF_UP);

        return OrderPricingResult.builder()
                .subtotal(subtotal)
                .promotionDiscount(promotionDiscount)
                .couponDiscount(couponDiscount)
                .finalPrice(finalPrice)
                .couponCode(coupon != null ? coupon.getCode() : null)
                .appliedCoupon(coupon)
                .items(orderLines.stream().map(this::toPricingItem).toList())
                .build();
    }

    private OrderPricingItemResponse toPricingItem(OrderLine line) {
        int effectiveStock = resolveEffectiveStock(line.variant());

        return OrderPricingItemResponse.builder()
                .variantId(line.variant().getId())
                .productId(line.variant().getProduct().getId())
                .productName(line.variant().getProduct().getName())
                .brand(line.variant().getProduct().getBrand() != null ? line.variant().getProduct().getBrand().getName() : null)
                .sku(line.variant().getSku())
                .size(line.variant().getSize() != null ? line.variant().getSize().getName() : null)
                .stockQuantity(effectiveStock)
                .imageUrl(line.variant().getImageUrl())
                .quantity(line.quantity())
                .baseUnitPrice(line.baseLineTotal().divide(BigDecimal.valueOf(line.quantity()), 2, RoundingMode.HALF_UP))
                .finalUnitPrice(line.finalUnitPrice())
                .lineTotal(line.finalLineTotal())
                .lineDiscount(line.promotionDiscount())
                .build();
    }

    private List<OrderLine> buildOrderLinesForWrite(List<OrderItemRequest> items) {
        List<OrderLine> orderLines = new ArrayList<>();

        for (OrderItemRequest item : items) {
            // Avoid `FOR UPDATE` here: order creation may happen in flows that are logically "read" (pricing/checkout),
            // and stock will be locked/deducted only when payment is confirmed.
            Variant variant = variantRepository.findReadOnlyWithProductById(item.getVariantId())
                    .orElseThrow(() -> new NotFoundException("Variant not found: " + item.getVariantId()));

            int effectiveStock = resolveEffectiveStock(variant);

            if (!vnpayProperties.isDemoMode() && effectiveStock < item.getQuantity()) {
                throw new BadRequestException("Insufficient stock for variant: " + variant.getSku() + " (available: " + effectiveStock + ")");
            }

            BigDecimal baseUnitPrice = variant.getProduct().getBasePrice().add(variant.getAdditionalPrice()).setScale(2, RoundingMode.HALF_UP);
            BigDecimal promotionDiscountPerUnit = applyPromotion(variant, baseUnitPrice);
            BigDecimal finalUnitPrice = baseUnitPrice.subtract(promotionDiscountPerUnit).max(BigDecimal.ZERO).setScale(2, RoundingMode.HALF_UP);
            BigDecimal quantity = BigDecimal.valueOf(item.getQuantity());

            orderLines.add(new OrderLine(
                    variant,
                    item.getQuantity(),
                    baseUnitPrice.multiply(quantity).setScale(2, RoundingMode.HALF_UP),
                    promotionDiscountPerUnit.multiply(quantity).setScale(2, RoundingMode.HALF_UP),
                    finalUnitPrice,
                    finalUnitPrice.multiply(quantity).setScale(2, RoundingMode.HALF_UP)
            ));
        }

        return orderLines;
    }

    private List<OrderLine> buildOrderLinesReadOnly(List<OrderItemRequest> items) {
        List<OrderLine> orderLines = new ArrayList<>();

        for (OrderItemRequest item : items) {
            Variant variant = variantRepository.findReadOnlyWithProductById(item.getVariantId())
                    .orElseThrow(() -> new NotFoundException("Variant not found: " + item.getVariantId()));

            int effectiveStock = resolveEffectiveStock(variant);

            if (!vnpayProperties.isDemoMode() && effectiveStock < item.getQuantity()) {
                throw new BadRequestException("Insufficient stock for variant: " + variant.getSku() + " (available: " + effectiveStock + ")");
            }

            BigDecimal baseUnitPrice = variant.getProduct().getBasePrice().add(variant.getAdditionalPrice()).setScale(2, RoundingMode.HALF_UP);
            BigDecimal promotionDiscountPerUnit = applyPromotion(variant, baseUnitPrice);
            BigDecimal finalUnitPrice = baseUnitPrice.subtract(promotionDiscountPerUnit).max(BigDecimal.ZERO).setScale(2, RoundingMode.HALF_UP);
            BigDecimal quantity = BigDecimal.valueOf(item.getQuantity());

            orderLines.add(new OrderLine(
                    variant,
                    item.getQuantity(),
                    baseUnitPrice.multiply(quantity).setScale(2, RoundingMode.HALF_UP),
                    promotionDiscountPerUnit.multiply(quantity).setScale(2, RoundingMode.HALF_UP),
                    finalUnitPrice,
                    finalUnitPrice.multiply(quantity).setScale(2, RoundingMode.HALF_UP)
            ));
        }

        return orderLines;
    }

    private BigDecimal calculatePromotionDiscount(BigDecimal baseUnitPrice, Promotion promotion) {
        BigDecimal discount = switch (promotion.getType()) {
            case PERCENTAGE -> baseUnitPrice.multiply(promotion.getDiscountValue())
                    .divide(ONE_HUNDRED, 2, RoundingMode.HALF_UP);
            case FIXED_AMOUNT -> promotion.getDiscountValue().min(baseUnitPrice);
            case BUY_X_GET_Y -> BigDecimal.ZERO;
        };

        if (promotion.getMaxDiscountValue() != null && discount.compareTo(promotion.getMaxDiscountValue()) > 0) {
            discount = promotion.getMaxDiscountValue();
        }

        return discount;
    }

    private int resolveEffectiveStock(Variant variant) {
        int variantStock = variant.getStockQuantity() != null ? variant.getStockQuantity() : 0;
        Integer productStockRaw = variant.getProduct() != null ? variant.getProduct().getTotalQuantity() : null;
        if (productStockRaw != null && productStockRaw > 0) {
            return productStockRaw;
        }
        return variantStock;
    }

    private String generateOrderCode(String userId) {
        return "ORD-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss")) + "-U" + userId;
    }

    private Address createAddressFromRequest(User user, OrderRequest request) {
        if (!StringUtils.hasText(request.getRecipientName())
                || !StringUtils.hasText(request.getPhoneNumber())
                || !StringUtils.hasText(request.getAddressLine())
                || !StringUtils.hasText(request.getDistrict())
                || !StringUtils.hasText(request.getCity())) {
            throw new NotFoundException("Address not found");
        }

        Address newAddress = Address.builder()
                .user(user)
                .recipientName(request.getRecipientName())
                .phoneNumber(request.getPhoneNumber())
                .addressLine(request.getAddressLine())
                .ward(request.getWard())
                .district(request.getDistrict())
                .city(request.getCity())
                .country(StringUtils.hasText(request.getCountry()) ? request.getCountry() : "Viá»‡t Nam")
                .postalCode(request.getPostalCode())
                .build();
        return addressRepository.save(newAddress);
    }

    public record OrderLine(
            Variant variant,
            Integer quantity,
            BigDecimal baseLineTotal,
            BigDecimal promotionDiscount,
            BigDecimal finalUnitPrice,
            BigDecimal finalLineTotal
    ) {
    }

    @Transactional(readOnly = true)
    public List<OrderListResponse> getOrdersByUserId(String userId) {
        List<Order> orders = orderRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return orders.stream().map(order -> {
            String firstProductName = "";
            List<String> imageUrls = new ArrayList<>();
            int totalItems = 0;
            
            for (OrderItem item : order.getItems()) {
                if (firstProductName.isEmpty()) {
                    firstProductName = item.getProductName();
                }
                if (item.getVariant() != null && item.getVariant().getImageUrl() != null && imageUrls.size() < 3) {
                    imageUrls.add(item.getVariant().getImageUrl());
                }
                totalItems += item.getQuantity() != null ? item.getQuantity() : 0;
            }

            return OrderListResponse.builder()
                    .id(order.getId())
                    .orderCode(order.getOrderCode())
                    .createdAt(order.getCreatedAt())
                    .status(order.getStatus() != null ? order.getStatus().name() : "UNKNOWN")
                    .finalPrice(order.getFinalPrice())
                    .paymentMethod(order.getPayment() != null && order.getPayment().getMethod() != null ? order.getPayment().getMethod().name() : "N/A")
                    .paymentStatus(order.getPayment() != null && order.getPayment().getStatus() != null ? order.getPayment().getStatus().name() : "UNKNOWN")
                    .firstProductName(firstProductName)
                    .imageUrls(imageUrls)
                    .totalItems(totalItems)
                    .build();
        }).toList();
    }

    @Transactional
    public void cancelOrder(String orderId, String userId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new NotFoundException("Order not found with id: " + orderId));
        
        if (!order.getUser().getId().equals(userId)) {
            throw new BadRequestException("You do not have permission to cancel this order");
        }
        
        if (order.getStatus() != OrderStatus.PENDING) {
            throw new BadRequestException("Only pending orders can be cancelled");
        }
        
        order.setStatus(OrderStatus.CANCELLED);
        if (order.getPayment() != null && order.getPayment().getStatus() == PaymentStatus.PENDING) {
            order.getPayment().setStatus(PaymentStatus.FAILED);
            order.getPayment().setNote("Cancelled by user");
        }
        
        // Restore stock
        for (OrderItem item : order.getItems()) {
            Variant variant = item.getVariant();
            if (variant != null && item.getQuantity() != null) {
                int variantStock = variant.getStockQuantity() != null ? variant.getStockQuantity() : 0;
                variant.setStockQuantity(variantStock + item.getQuantity());
                if (variant.getProduct() != null && variant.getProduct().getTotalQuantity() != null) {
                    int productStock = variant.getProduct().getTotalQuantity();
                    variant.getProduct().setTotalQuantity(productStock + item.getQuantity());
                }
            }
        }
        
        // Restore coupon usage if any
        restoreCouponUsage(order);
        
        orderStatusHistoryRepository.save(OrderStatusHistory.builder()
                .order(order)
                .status(OrderStatus.CANCELLED)
                .note("Cancelled by user")
                .changedAt(LocalDateTime.now())
                .build());
        
        orderRepository.save(order);
        webSocketNotificationService.notifyOrderStatusUpdate(order, "Order cancelled", "ORDER_CANCELLED");
    }

    @Transactional
    public void restoreCouponUsage(Order order) {
        if (order.getCoupon() != null) {
            Coupon coupon = order.getCoupon();
            int currentUsed = coupon.getUsedCount() != null ? coupon.getUsedCount() : 0;
            coupon.setUsedCount(Math.max(0, currentUsed - 1));
            couponRepository.save(coupon);
            
            couponUsageRepository.findByOrderId(order.getId())
                    .ifPresent(couponUsageRepository::delete);
            log.info("Successfully restored coupon {} usage for order {}", coupon.getCode(), order.getId());
        }
    }

    @Transactional
    public void returnOrder(String orderId, String userId) {
        Order order = validateReturnableOrder(orderId, userId);

        List<ReturnOrderRequestItem> items = order.getItems().stream()
                .map(item -> new ReturnOrderRequestItem(item.getId(), Math.max(0,
                        (item.getQuantity() != null ? item.getQuantity() : 0)
                                - (item.getReturnedQuantity() != null ? item.getReturnedQuantity() : 0)
                                - (item.getRequestedReturnQuantity() != null ? item.getRequestedReturnQuantity() : 0))))
                .filter(item -> item.quantity() > 0)
                .toList();

        if (items.isEmpty()) {
            throw new BadRequestException("This order has no remaining items to request return");
        }

        processReturn(order, items, "Khách hàng gửi yêu cầu trả toàn bộ đơn hàng");
        orderRepository.save(order);
    }

    @Transactional
    public OrderDetailResponse returnOrderItems(String orderId, ReturnOrderRequest request) {
        Order order = validateReturnableOrder(orderId, request.getUserId());

        List<ReturnOrderRequestItem> items = request.getItems().stream()
                .map(item -> new ReturnOrderRequestItem(item.getOrderItemId(), item.getQuantity()))
                .toList();

        processReturn(order, items, StringUtils.hasText(request.getNote()) ? request.getNote().trim() : "Khách hàng gửi yêu cầu trả một phần đơn hàng");
        Order savedOrder = orderRepository.save(order);
        return getOrderDetail(savedOrder.getId());
    }

    @Transactional
    public OrderDetailResponse approveReturnRequest(String orderId, String note) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new NotFoundException("Order not found with id: " + orderId));

        if (order.getStatus() != OrderStatus.RETURN_REQUESTED) {
            throw new BadRequestException("This order does not have a pending return request");
        }

        boolean approved = false;
        List<String> summaries = new ArrayList<>();
        for (OrderItem item : order.getItems()) {
            int requestedQuantity = item.getRequestedReturnQuantity() != null ? item.getRequestedReturnQuantity() : 0;
            if (requestedQuantity <= 0) {
                continue;
            }
            int returnedQuantity = item.getReturnedQuantity() != null ? item.getReturnedQuantity() : 0;
            item.setReturnedQuantity(returnedQuantity + requestedQuantity);
            item.setRequestedReturnQuantity(0);
            restoreStock(item, requestedQuantity);
            summaries.add(item.getProductName() + " x" + requestedQuantity);
            approved = true;
        }

        if (!approved) {
            throw new BadRequestException("No requested return items found for this order");
        }

        recalculateOrderTotals(order);
        String historyNote = StringUtils.hasText(note) ? note.trim() : "Admin duyệt yêu cầu trả hàng";
        if (!summaries.isEmpty()) {
            historyNote = historyNote + ": " + String.join(", ", summaries);
        }
        orderStatusHistoryRepository.save(OrderStatusHistory.builder()
                .order(order)
                .status(order.getStatus())
                .note(historyNote)
                .changedAt(LocalDateTime.now())
                .build());

        Order savedOrder = orderRepository.save(order);
        webSocketNotificationService.notifyOrderStatusUpdate(savedOrder, "Return request approved", "ADMIN_RETURN_APPROVED");
        return getOrderDetail(savedOrder.getId());
    }

    @Transactional
    public OrderDetailResponse rejectReturnRequest(String orderId, String note) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new NotFoundException("Order not found with id: " + orderId));

        if (order.getStatus() != OrderStatus.RETURN_REQUESTED) {
            throw new BadRequestException("This order does not have a pending return request");
        }

        for (OrderItem item : order.getItems()) {
            item.setRequestedReturnQuantity(0);
        }

        order.setStatus(OrderStatus.DELIVERED);
        orderStatusHistoryRepository.save(OrderStatusHistory.builder()
                .order(order)
                .status(OrderStatus.DELIVERED)
                .note(StringUtils.hasText(note) ? note.trim() : "Admin từ chối yêu cầu trả hàng")
                .changedAt(LocalDateTime.now())
                .build());

        Order savedOrder = orderRepository.save(order);
        webSocketNotificationService.notifyOrderStatusUpdate(savedOrder, "Return request rejected", "ADMIN_RETURN_REJECTED");
        return getOrderDetail(savedOrder.getId());
    }

    private Order validateReturnableOrder(String orderId, String userId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new NotFoundException("Order not found with id: " + orderId));

        if (!order.getUser().getId().equals(userId)) {
            throw new BadRequestException("You do not have permission to return this order");
        }

        if (order.getStatus() != OrderStatus.DELIVERED && order.getStatus() != OrderStatus.RETURN_REQUESTED) {
            throw new BadRequestException("Only delivered orders can create a return request");
        }
        return order;
    }

    private void processReturn(Order order, List<ReturnOrderRequestItem> requestedItems, String note) {
        if (requestedItems == null || requestedItems.isEmpty()) {
            throw new BadRequestException("Please select at least one product to return");
        }

        List<String> requestSummaries = new ArrayList<>();

        for (ReturnOrderRequestItem requestedItem : requestedItems) {
            OrderItem orderItem = order.getItems().stream()
                    .filter(item -> item.getId().equals(requestedItem.orderItemId()))
                    .findFirst()
                    .orElseThrow(() -> new NotFoundException("Order item not found with id: " + requestedItem.orderItemId()));

            int orderedQuantity = orderItem.getQuantity() != null ? orderItem.getQuantity() : 0;
            int returnedQuantity = orderItem.getReturnedQuantity() != null ? orderItem.getReturnedQuantity() : 0;
            int requestedReturnQuantity = orderItem.getRequestedReturnQuantity() != null ? orderItem.getRequestedReturnQuantity() : 0;
            int remainingQuantity = Math.max(0, orderedQuantity - returnedQuantity - requestedReturnQuantity);

            if (requestedItem.quantity() <= 0) {
                throw new BadRequestException("Return quantity must be greater than zero");
            }

            if (requestedItem.quantity() > remainingQuantity) {
                throw new BadRequestException("Return quantity exceeds remaining quantity for product: " + orderItem.getProductName());
            }

            orderItem.setRequestedReturnQuantity(requestedReturnQuantity + requestedItem.quantity());
            requestSummaries.add(orderItem.getProductName() + " x" + requestedItem.quantity());
        }

        order.setStatus(OrderStatus.RETURN_REQUESTED);

        String historyNote = StringUtils.hasText(note) ? note.trim() : "Khách hàng gửi yêu cầu trả hàng";
        if (!requestSummaries.isEmpty()) {
            historyNote = historyNote + ": " + String.join(", ", requestSummaries);
        }

        orderStatusHistoryRepository.save(OrderStatusHistory.builder()
                .order(order)
                .status(OrderStatus.RETURN_REQUESTED)
                .note(historyNote)
                .changedAt(LocalDateTime.now())
                .build());

        webSocketNotificationService.notifyOrderStatusUpdate(order, "Order return requested", "ORDER_RETURN_REQUESTED");
    }

    private void restoreStock(OrderItem item, int quantity) {
        Variant variant = item.getVariant();
        if (variant == null || quantity <= 0) {
            return;
        }

        int variantStock = variant.getStockQuantity() != null ? variant.getStockQuantity() : 0;
        variant.setStockQuantity(variantStock + quantity);
        if (variant.getProduct() != null && variant.getProduct().getTotalQuantity() != null) {
            int productStock = variant.getProduct().getTotalQuantity();
            variant.getProduct().setTotalQuantity(productStock + quantity);
        }
    }

    private void recalculateOrderTotals(Order order) {
        BigDecimal originalSubtotal = order.getSubtotalAmount() != null ? order.getSubtotalAmount() : BigDecimal.ZERO;
        BigDecimal originalPromotionDiscount = calculatePromotionDiscountFromOrder(order);
        BigDecimal originalPriceAfterPromotion = originalSubtotal.subtract(originalPromotionDiscount).max(BigDecimal.ZERO).setScale(2, RoundingMode.HALF_UP);
        BigDecimal originalCouponDiscount = calculateCouponDiscountFromOrder(order);

        BigDecimal subtotal = BigDecimal.ZERO;
        BigDecimal promotionDiscount = BigDecimal.ZERO;
        BigDecimal priceAfterPromotion = BigDecimal.ZERO;

        for (OrderItem item : order.getItems()) {
            int remainingQuantity = Math.max(0, (item.getQuantity() != null ? item.getQuantity() : 0) - (item.getReturnedQuantity() != null ? item.getReturnedQuantity() : 0));
            if (remainingQuantity <= 0) {
                continue;
            }

            BigDecimal currentBaseUnitPrice = item.getVariant().getProduct().getBasePrice()
                    .add(item.getVariant().getAdditionalPrice())
                    .setScale(2, RoundingMode.HALF_UP);
            BigDecimal quantityValue = BigDecimal.valueOf(remainingQuantity);
            BigDecimal lineSubtotal = currentBaseUnitPrice.multiply(quantityValue).setScale(2, RoundingMode.HALF_UP);
            BigDecimal linePriceAfterPromotion = item.getUnitPrice().multiply(quantityValue).setScale(2, RoundingMode.HALF_UP);

            subtotal = subtotal.add(lineSubtotal);
            priceAfterPromotion = priceAfterPromotion.add(linePriceAfterPromotion);
            promotionDiscount = promotionDiscount.add(lineSubtotal.subtract(linePriceAfterPromotion).max(BigDecimal.ZERO));
        }

        BigDecimal couponDiscount = BigDecimal.ZERO;
        if (originalPriceAfterPromotion.compareTo(BigDecimal.ZERO) > 0 && originalCouponDiscount.compareTo(BigDecimal.ZERO) > 0) {
            couponDiscount = priceAfterPromotion
                    .multiply(originalCouponDiscount)
                    .divide(originalPriceAfterPromotion, 2, RoundingMode.HALF_UP)
                    .min(priceAfterPromotion)
                    .setScale(2, RoundingMode.HALF_UP);
        }

        boolean hasRemainingItems = order.getItems().stream()
                .anyMatch(item -> Math.max(0, (item.getQuantity() != null ? item.getQuantity() : 0) - (item.getReturnedQuantity() != null ? item.getReturnedQuantity() : 0)) > 0);

        BigDecimal shippingFee = hasRemainingItems ? SHIPPING_FEE : BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        BigDecimal finalPrice = priceAfterPromotion.subtract(couponDiscount).max(BigDecimal.ZERO).add(shippingFee).setScale(2, RoundingMode.HALF_UP);

        order.setSubtotalAmount(subtotal.setScale(2, RoundingMode.HALF_UP));
        order.setDiscountAmount(promotionDiscount.add(couponDiscount).setScale(2, RoundingMode.HALF_UP));
        order.setShippingFee(shippingFee);
        order.setFinalPrice(finalPrice);
        order.setStatus(hasRemainingItems ? OrderStatus.DELIVERED : OrderStatus.RETURNED);

        if (order.getPayment() != null) {
            order.getPayment().setAmount(finalPrice);
            if (!hasRemainingItems) {
                order.getPayment().setStatus(PaymentStatus.REFUNDED);
                order.getPayment().setNote("Refunded after approved return");
            } else {
                order.getPayment().setNote("Adjusted after approved partial return");
            }
        }
    }

    private record ReturnOrderRequestItem(String orderItemId, Integer quantity) {
    }
}
