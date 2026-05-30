package com.example.graduationproject.payment.controller;

import com.example.graduationproject.common.api.ApiResponse;
import com.example.graduationproject.payment.config.VnpayProperties;
import com.example.graduationproject.payment.dto.CreatePaymentRequest;
import com.example.graduationproject.payment.dto.CreatePaymentResponse;
import com.example.graduationproject.payment.dto.PaymentStatusResponse;
import com.example.graduationproject.payment.service.PaymentGatewayService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PathVariable;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentGatewayService paymentGatewayService;
    private final VnpayProperties vnpayProperties;

    @PostMapping("/vnpay/create")
    public ResponseEntity<ApiResponse<CreatePaymentResponse>> createVnpayPayment(@Valid @RequestBody CreatePaymentRequest request,
                                                                                 HttpServletRequest servletRequest) {
        String ipAddress = servletRequest.getRemoteAddr();
        CreatePaymentResponse response = paymentGatewayService.createVnpayPaymentUrl(request.getOrderId(), ipAddress);
        return ResponseEntity.ok(ApiResponse.success("VNPay URL created", response));
    }

    @GetMapping("/vnpay/return")
    public void vnpayReturn(@RequestParam Map<String, String> params, HttpServletResponse response) throws IOException {
        String redirectBase = resolveFrontendRedirectBase();
        // Remove /payment-result if present to get the root frontend url
        if (redirectBase.endsWith("/payment-result")) {
            redirectBase = redirectBase.substring(0, redirectBase.length() - "/payment-result".length());
        }

        try {
            PaymentStatusResponse status = paymentGatewayService.handleVnpayReturnOrIpn(params);
            if ("PAID".equals(status.getPaymentStatus().name())) {
                response.sendRedirect(redirectBase + "/orders/" + status.getOrderId());
                return;
            }
            String url = redirectBase + "/payment-result"
                    + "?orderId=" + status.getOrderId()
                    + "&paymentStatus=" + urlEncode(status.getPaymentStatus().name())
                    + "&orderStatus=" + urlEncode(status.getOrderStatus().name())
                    + "&provider=VNPAY";
            response.sendRedirect(url);
        } catch (Exception ex) {
            String url = redirectBase
                    + "?paymentStatus=FAILED&orderStatus=CANCELLED&provider=VNPAY"
                    + "&message=" + urlEncode(ex.getMessage());
            response.sendRedirect(url);
        }
    }

    @GetMapping("/vnpay/demo-pay")
    public void vnpayDemoPay(@RequestParam("txnRef") String txnRef, HttpServletResponse response) throws IOException {
        String redirectBase = resolveFrontendRedirectBase();
        if (redirectBase.endsWith("/payment-result")) {
            redirectBase = redirectBase.substring(0, redirectBase.length() - "/payment-result".length());
        }

        try {
            PaymentStatusResponse status = paymentGatewayService.completeVnpayDemoPayment(txnRef);
            if ("PAID".equals(status.getPaymentStatus().name())) {
                response.sendRedirect(redirectBase + "/orders/" + status.getOrderId());
                return;
            }
            String url = redirectBase + "/payment-result"
                    + "?orderId=" + status.getOrderId()
                    + "&paymentStatus=" + urlEncode(status.getPaymentStatus().name())
                    + "&orderStatus=" + urlEncode(status.getOrderStatus().name())
                    + "&provider=VNPAY";
            response.sendRedirect(url);
        } catch (Exception ex) {
            String url = redirectBase + "/payment-result"
                    + "?paymentStatus=FAILED&orderStatus=CANCELLED&provider=VNPAY"
                    + "&message=" + urlEncode(ex.getMessage());
            response.sendRedirect(url);
        }
    }

    @PostMapping("/vnpay/demo-complete")
    public ResponseEntity<ApiResponse<PaymentStatusResponse>> vnpayDemoComplete(@RequestParam("orderId") String orderId) {
        PaymentStatusResponse status = paymentGatewayService.completeVnpayDemoPaymentByOrderId(orderId);
        return ResponseEntity.ok(ApiResponse.success("VNPay demo payment completed", status));
    }

    @GetMapping("/vnpay/ipn")
    public ResponseEntity<Map<String, String>> vnpayIpn(@RequestParam Map<String, String> params) {
        return ResponseEntity.ok(paymentGatewayService.handleVnpayIpn(params));
    }

    @PostMapping("/momo/create")
    public ResponseEntity<ApiResponse<CreatePaymentResponse>> createMomoPayment(@Valid @RequestBody CreatePaymentRequest request) {
        CreatePaymentResponse response = paymentGatewayService.createMomoPaymentUrl(request.getOrderId());
        return ResponseEntity.ok(ApiResponse.success("MoMo URL created", response));
    }

    @GetMapping("/momo/return")
    public ResponseEntity<ApiResponse<Map<String, String>>> momoReturn(@RequestParam Map<String, String> params) {
        paymentGatewayService.handleMomoIpn(new HashMap<>(params));
        return ResponseEntity.ok(ApiResponse.success("MoMo return processed", Map.of("result", "OK")));
    }

    @PostMapping("/momo/ipn")
    public ResponseEntity<Void> momoIpn(@RequestBody Map<String, Object> payload) {
        paymentGatewayService.handleMomoIpn(payload);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/orders/{orderId}/status")
    public ResponseEntity<ApiResponse<PaymentStatusResponse>> getOrderPaymentStatus(@PathVariable String orderId) {
        return ResponseEntity.ok(ApiResponse.success("Payment status fetched", paymentGatewayService.getPaymentStatusByOrder(orderId)));
    }

    private String resolveFrontendRedirectBase() {
        String redirectBase = vnpayProperties.getFrontendReturnUrl();
        if (redirectBase == null || redirectBase.isBlank()) {
            return "http://localhost:3000/payment-result";
        }
        return redirectBase;
    }

    private String urlEncode(String value) {
        return URLEncoder.encode(value == null ? "" : value, StandardCharsets.UTF_8);
    }
}

