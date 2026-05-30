package com.example.graduationproject.payment.service;

import com.example.graduationproject.entity.Order;
import com.example.graduationproject.entity.Payment;
import com.example.graduationproject.entity.enums.OrderStatus;
import com.example.graduationproject.entity.enums.PaymentMethod;
import com.example.graduationproject.entity.enums.PaymentStatus;
import com.example.graduationproject.exception.BadRequestException;
import com.example.graduationproject.exception.NotFoundException;
import com.example.graduationproject.payment.config.MomoProperties;
import com.example.graduationproject.payment.config.VnpayProperties;
import com.example.graduationproject.payment.dto.CreatePaymentResponse;
import com.example.graduationproject.payment.dto.PaymentStatusResponse;
import com.example.graduationproject.payment.util.PaymentSignUtils;
import com.example.graduationproject.payment.repository.OrderRepository;
import com.example.graduationproject.payment.repository.PaymentRepository;
import com.example.graduationproject.payment.repository.CartItemRepository;
import com.example.graduationproject.payment.repository.CartRepository;
import com.example.graduationproject.entity.enums.CartStatus;
import com.example.graduationproject.service.WebSocketNotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentGatewayService {

    private static final DateTimeFormatter VNP_DATE_FORMAT = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");

    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final VnpayProperties vnpayProperties;
    private final MomoProperties momoProperties;
    private final WebSocketNotificationService webSocketNotificationService;

    @Transactional
    public CreatePaymentResponse createVnpayPaymentUrl(String orderId, String ipAddress) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new NotFoundException("Order not found"));

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new BadRequestException("Order is not in payable state");
        }

        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseGet(() -> buildPendingPayment(order));

        String txnRef = order.getOrderCode() + "-" + System.currentTimeMillis();
        payment.setProvider("VNPAY");
        payment.setMethod(PaymentMethod.BANK_TRANSFER);
        payment.setStatus(PaymentStatus.PENDING);
        payment.setTransactionCode(txnRef);
        payment.setNote("VNPay payment initialized");
        paymentRepository.save(payment);

        if (vnpayProperties.isDemoMode()) {
            String base = (vnpayProperties.getDemoPayUrl() == null || vnpayProperties.getDemoPayUrl().isBlank())
                    ? "http://localhost:8080/api/payments/vnpay/demo-pay"
                    : vnpayProperties.getDemoPayUrl();
            String paymentUrl = base + "?txnRef=" + txnRef;
            return CreatePaymentResponse.builder()
                    .provider("VNPAY")
                    .paymentUrl(paymentUrl)
                    .transactionCode(txnRef)
                    .build();
        }

        LocalDateTime now = LocalDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh"));

        Map<String, String> params = new HashMap<>();
        params.put("vnp_Version", "2.1.0");
        params.put("vnp_Command", "pay");
        params.put("vnp_TmnCode", vnpayProperties.getTmnCode());
        params.put("vnp_Amount", payment.getAmount().multiply(BigDecimal.valueOf(100)).toBigInteger().toString());
        params.put("vnp_CurrCode", "VND");
        params.put("vnp_TxnRef", txnRef);
        params.put("vnp_OrderInfo", "Thanh toan don hang " + order.getOrderCode());
        params.put("vnp_OrderType", "other");
        params.put("vnp_Locale", "vn");
        params.put("vnp_ReturnUrl", vnpayProperties.getReturnUrl());
        params.put("vnp_IpAddr", ipAddress);
        params.put("vnp_CreateDate", now.format(VNP_DATE_FORMAT));
        params.put("vnp_ExpireDate", now.plusMinutes(15).format(VNP_DATE_FORMAT));

        String query = PaymentSignUtils.buildSortedQuery(params);
        String secureHash = PaymentSignUtils.hmacSha512(vnpayProperties.getHashSecret(), query);
        String paymentUrl = vnpayProperties.getPayUrl() + "?" + query + "&vnp_SecureHash=" + secureHash;

        return CreatePaymentResponse.builder()
                .provider("VNPAY")
                .paymentUrl(paymentUrl)
                .transactionCode(txnRef)
                .build();
    }

    @Transactional
    public PaymentStatusResponse handleVnpayReturnOrIpn(Map<String, String> callbackParams) {
        return processVnpayCallback(callbackParams, false);
    }

    @Transactional
    public Map<String, String> handleVnpayIpn(Map<String, String> callbackParams) {
        try {
            processVnpayCallback(callbackParams, true);
            return Map.of("RspCode", "00", "Message", "Confirm Success");
        } catch (BadRequestException ex) {
            String message = ex.getMessage() != null ? ex.getMessage() : "Invalid request";
            if (message.contains("signature")) {
                return Map.of("RspCode", "97", "Message", "Invalid signature");
            }
            if (message.contains("already confirmed")) {
                return Map.of("RspCode", "02", "Message", "Order already confirmed");
            }
            return Map.of("RspCode", "99", "Message", "Invalid request");
        } catch (NotFoundException ex) {
            return Map.of("RspCode", "01", "Message", "Order not found");
        } catch (Exception ex) {
            log.error("VNPay IPN processing error", ex);
            return Map.of("RspCode", "99", "Message", "Unknown error");
        }
    }

    private PaymentStatusResponse processVnpayCallback(Map<String, String> callbackParams, boolean strictIpn) {
        verifyVnpaySignature(callbackParams);

        String txnRef = callbackParams.get("vnp_TxnRef");
        if (txnRef == null || txnRef.isBlank()) {
            throw new BadRequestException("Missing vnp_TxnRef");
        }

        String responseCode = callbackParams.getOrDefault("vnp_ResponseCode", "99");
        String transactionStatus = callbackParams.getOrDefault("vnp_TransactionStatus", responseCode);

        Payment payment = paymentRepository.findByProviderAndTransactionCode("VNPAY", txnRef)
                .orElseThrow(() -> new NotFoundException("Payment not found"));

        verifyVnpayAmount(callbackParams, payment);

        if (payment.getStatus() == PaymentStatus.PAID || payment.getStatus() == PaymentStatus.FAILED) {
            if (strictIpn) {
                throw new BadRequestException("Payment already confirmed");
            }
            return mapPaymentStatus(payment);
        }

        boolean success = "00".equals(responseCode) && "00".equals(transactionStatus);

        if (success) {
            payment.setStatus(PaymentStatus.PAID);
            payment.setPaidAt(LocalDateTime.now());
            payment.setNote("VNPay paid: txnNo=" + callbackParams.getOrDefault("vnp_TransactionNo", ""));
            removeOrderedItemsFromCart(payment.getOrder());
        } else {
            payment.setStatus(PaymentStatus.FAILED);
            payment.setNote("VNPay failed: responseCode=" + responseCode + ", transactionStatus=" + transactionStatus);
            // Keep order PENDING so they can retry payment
        }
        paymentRepository.save(payment);
        if (payment.getStatus() == PaymentStatus.PAID) {
            webSocketNotificationService.notifyOrderStatusUpdate(payment.getOrder(), "Thanh toán VNPAY thành công, đơn hàng chờ admin xác nhận", "PAYMENT_UPDATED");
        } else {
            webSocketNotificationService.notifyOrderStatusUpdate(payment.getOrder(), "Payment updated via VNPAY", "PAYMENT_UPDATED");
        }
        return mapPaymentStatus(payment);
    }

    private void verifyVnpaySignature(Map<String, String> callbackParams) {
        String secureHash = callbackParams.get("vnp_SecureHash");
        if (secureHash == null || secureHash.isBlank()) {
            throw new BadRequestException("Missing vnp_SecureHash");
        }

        Map<String, String> verifyMap = new HashMap<>(callbackParams);
        verifyMap.remove("vnp_SecureHash");
        verifyMap.remove("vnp_SecureHashType");

        String signData = PaymentSignUtils.buildSortedQuery(verifyMap);
        String expected = PaymentSignUtils.hmacSha512(vnpayProperties.getHashSecret(), signData);
        if (!expected.equalsIgnoreCase(secureHash)) {
            throw new BadRequestException("Invalid VNPay signature");
        }
    }

    private void verifyVnpayAmount(Map<String, String> callbackParams, Payment payment) {
        String vnpAmountRaw = callbackParams.get("vnp_Amount");
        if (vnpAmountRaw == null || vnpAmountRaw.isBlank()) {
            throw new BadRequestException("Missing vnp_Amount");
        }

        BigDecimal callbackAmount;
        try {
            callbackAmount = new BigDecimal(vnpAmountRaw)
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        } catch (Exception ex) {
            throw new BadRequestException("Invalid vnp_Amount");
        }

        BigDecimal expectedAmount = payment.getAmount().setScale(2, RoundingMode.HALF_UP);
        if (callbackAmount.compareTo(expectedAmount) != 0) {
            throw new BadRequestException("VNPay amount mismatch");
        }
    }

    @Transactional
    public PaymentStatusResponse completeVnpayDemoPayment(String txnRef) {
        Payment payment = paymentRepository.findByProviderAndTransactionCode("VNPAY", txnRef)
                .orElseThrow(() -> new NotFoundException("Payment not found"));

        if (payment.getStatus() != PaymentStatus.PAID) {
            payment.setStatus(PaymentStatus.PAID);
            payment.setPaidAt(LocalDateTime.now());
            payment.setNote("VNPay demo paid");
            removeOrderedItemsFromCart(payment.getOrder());
            paymentRepository.save(payment);
            webSocketNotificationService.notifyOrderStatusUpdate(payment.getOrder(), "Thanh toán VNPAY DEMO thành công, đơn hàng chờ admin xác nhận", "PAYMENT_UPDATED");
        }

        return mapPaymentStatus(payment);
    }

    @Transactional
    public PaymentStatusResponse completeVnpayDemoPaymentByOrderId(String orderId) {
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new NotFoundException("Payment not found for order"));

        if (!"VNPAY".equalsIgnoreCase(payment.getProvider())) {
            throw new BadRequestException("Order is not using VNPay payment");
        }

        if (payment.getStatus() != PaymentStatus.PAID) {
            payment.setStatus(PaymentStatus.PAID);
            payment.setPaidAt(LocalDateTime.now());
            payment.setNote("VNPay demo paid by orderId");
            removeOrderedItemsFromCart(payment.getOrder());
            paymentRepository.save(payment);
            webSocketNotificationService.notifyOrderStatusUpdate(payment.getOrder(), "Thanh toán VNPAY DEMO thành công, đơn hàng chờ admin xác nhận", "PAYMENT_UPDATED");
        }

        return mapPaymentStatus(payment);
    }

    @Transactional
    public CreatePaymentResponse createMomoPaymentUrl(String orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new NotFoundException("Order not found"));

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new BadRequestException("Order is not in payable state");
        }

        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseGet(() -> buildPendingPayment(order));

        String requestId = UUID.randomUUID().toString();
        String momoOrderId = order.getOrderCode() + "-" + System.currentTimeMillis();
        String amount = payment.getAmount().toBigInteger().toString();

        payment.setProvider("MOMO");
        payment.setMethod(PaymentMethod.E_WALLET);
        payment.setStatus(PaymentStatus.PENDING);
        payment.setTransactionCode(momoOrderId);
        payment.setNote("MoMo payment initialized");
        paymentRepository.save(payment);

        String rawSignature = "accessKey=" + momoProperties.getAccessKey()
                + "&amount=" + amount
                + "&extraData="
                + "&ipnUrl=" + momoProperties.getIpnUrl()
                + "&orderId=" + momoOrderId
                + "&orderInfo=Thanh toan don hang " + order.getOrderCode()
                + "&partnerCode=" + momoProperties.getPartnerCode()
                + "&redirectUrl=" + momoProperties.getReturnUrl()
                + "&requestId=" + requestId
                + "&requestType=captureWallet";

        String signature = PaymentSignUtils.hmacSha256(momoProperties.getSecretKey(), rawSignature);

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("partnerCode", momoProperties.getPartnerCode());
        payload.put("partnerName", "Shoe Store");
        payload.put("storeId", "ShoeStore");
        payload.put("requestId", requestId);
        payload.put("amount", amount);
        payload.put("orderId", momoOrderId);
        payload.put("orderInfo", "Thanh toan don hang " + order.getOrderCode());
        payload.put("redirectUrl", momoProperties.getReturnUrl());
        payload.put("ipnUrl", momoProperties.getIpnUrl());
        payload.put("lang", "vi");
        payload.put("extraData", "");
        payload.put("requestType", "captureWallet");
        payload.put("signature", signature);

        String paymentUrl = callMomoCreatePayment(payload);

        return CreatePaymentResponse.builder()
                .provider("MOMO")
                .paymentUrl(paymentUrl)
                .transactionCode(momoOrderId)
                .build();
    }

    @Transactional
    public void handleMomoIpn(Map<String, Object> payload) {
        String signature = Objects.toString(payload.get("signature"), "");
        String orderId = Objects.toString(payload.get("orderId"), "");
        String amount = Objects.toString(payload.get("amount"), "0");
        String resultCode = Objects.toString(payload.get("resultCode"), "99");
        String requestId = Objects.toString(payload.get("requestId"), "");
        String orderInfo = Objects.toString(payload.get("orderInfo"), "");
        String message = Objects.toString(payload.get("message"), "");
        String transId = Objects.toString(payload.get("transId"), "");
        String responseTime = Objects.toString(payload.get("responseTime"), "");
        String extraData = Objects.toString(payload.get("extraData"), "");

        String rawSignature = "accessKey=" + momoProperties.getAccessKey()
                + "&amount=" + amount
                + "&extraData=" + extraData
                + "&message=" + message
                + "&orderId=" + orderId
                + "&orderInfo=" + orderInfo
                + "&orderType=" + Objects.toString(payload.get("orderType"), "momo_wallet")
                + "&partnerCode=" + momoProperties.getPartnerCode()
                + "&payType=" + Objects.toString(payload.get("payType"), "")
                + "&requestId=" + requestId
                + "&responseTime=" + responseTime
                + "&resultCode=" + resultCode
                + "&transId=" + transId;

        String expected = PaymentSignUtils.hmacSha256(momoProperties.getSecretKey(), rawSignature);
        if (!expected.equals(signature)) {
            throw new BadRequestException("Invalid MoMo signature");
        }

        Payment payment = paymentRepository.findByProviderAndTransactionCode("MOMO", orderId)
                .orElseThrow(() -> new NotFoundException("Payment not found"));

        if (payment.getStatus() == PaymentStatus.PAID || payment.getStatus() == PaymentStatus.FAILED) {
            return;
        }

        if ("0".equals(resultCode)) {
            payment.setStatus(PaymentStatus.PAID);
            payment.setPaidAt(LocalDateTime.now());
            payment.setNote("MoMo paid: transId=" + transId);
            removeOrderedItemsFromCart(payment.getOrder());
        } else {
            payment.setStatus(PaymentStatus.FAILED);
            payment.setNote("MoMo failed: resultCode=" + resultCode);
            // Keep order PENDING so they can retry payment
        }
        paymentRepository.save(payment);
        webSocketNotificationService.notifyOrderStatusUpdate(payment.getOrder(), "Payment updated via MoMo", "PAYMENT_UPDATED");
    }

    @Transactional(readOnly = true)
    public PaymentStatusResponse getPaymentStatusByOrder(String orderId) {
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new NotFoundException("Payment not found for order"));

        return mapPaymentStatus(payment);
    }

    private PaymentStatusResponse mapPaymentStatus(Payment payment) {
        return PaymentStatusResponse.builder()
                .orderId(payment.getOrder().getId())
                .provider(payment.getProvider())
                .paymentStatus(payment.getStatus())
                .orderStatus(payment.getOrder().getStatus())
                .transactionCode(payment.getTransactionCode())
                .build();
    }

    private Payment buildPendingPayment(Order order) {
        return Payment.builder()
                .order(order)
                .user(order.getUser())
                .amount(order.getFinalPrice())
                .status(PaymentStatus.PENDING)
                .method(PaymentMethod.BANK_TRANSFER)
                .provider(null)
                .transactionCode(UUID.randomUUID().toString())
                .note("Payment created")
                .build();
    }

    private void restoreStockForCancelledOrder(Order order) {
        if (order.getItems() == null || order.getItems().isEmpty()) {
            return;
        }

        order.getItems().forEach(item -> {
            if (item.getVariant() == null || item.getQuantity() == null) {
                return;
            }

            int quantity = Math.max(item.getQuantity(), 0);
            int variantStock = item.getVariant().getStockQuantity() != null ? item.getVariant().getStockQuantity() : 0;
            item.getVariant().setStockQuantity(variantStock + quantity);

            if (item.getVariant().getProduct() != null && item.getVariant().getProduct().getTotalQuantity() != null) {
                int productStock = item.getVariant().getProduct().getTotalQuantity();
                item.getVariant().getProduct().setTotalQuantity(productStock + quantity);
            }
        });
    }

    private void removeOrderedItemsFromCart(Order order) {
        if (order == null || order.getUser() == null || order.getItems() == null || order.getItems().isEmpty()) {
            return;
        }

        cartRepository.findByUserIdAndStatus(order.getUser().getId(), CartStatus.ACTIVE)
                .ifPresent(cart -> {
                    boolean modified = false;
                    for (com.example.graduationproject.entity.OrderItem orderItem : order.getItems()) {
                        if (orderItem.getVariant() != null) {
                            String variantId = orderItem.getVariant().getId();
                            
                            // Find and delete from database first
                            java.util.Optional<com.example.graduationproject.entity.CartItem> itemToDelete = cart.getItems().stream()
                                    .filter(cartItem -> cartItem.getVariant() != null && cartItem.getVariant().getId().equals(variantId))
                                    .findFirst();
                            if (itemToDelete.isPresent()) {
                                cartItemRepository.delete(itemToDelete.get());
                                cart.getItems().remove(itemToDelete.get());
                                modified = true;
                            }
                        }
                    }
                    if (modified) {
                        BigDecimal newTotal = cart.getItems().stream()
                                .map(item -> item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                                .reduce(BigDecimal.ZERO, BigDecimal::add);
                        cart.setTotalPrice(newTotal);
                        if (cart.getItems().isEmpty()) {
                            cart.setCoupon(null);
                        }
                        cartRepository.save(cart);
                        log.info("Removed successfully paid items from cart for user {}", order.getUser().getId());
                    }
                });
    }

    private String callMomoCreatePayment(Map<String, Object> payload) {
        if (momoProperties.getEndpoint() == null || momoProperties.getEndpoint().isBlank()) {
            return "";
        }

        try {
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(payload, headers);
            ResponseEntity<Map> responseEntity = restTemplate.exchange(momoProperties.getEndpoint(), HttpMethod.POST, requestEntity, Map.class);
            if (responseEntity.getBody() == null) {
                throw new BadRequestException("MoMo response is empty");
            }
            Object payUrl = responseEntity.getBody().get("payUrl");
            if (payUrl == null) {
                throw new BadRequestException("MoMo payUrl is missing");
            }
            return payUrl.toString();
        } catch (Exception ex) {
            log.error("Cannot create MoMo payment URL", ex);
            throw new BadRequestException("Cannot create MoMo payment URL: " + ex.getMessage());
        }
    }
}




