package com.example.graduationproject.controller;

import com.example.graduationproject.common.api.ApiResponse;
import com.example.graduationproject.service.OrderService;
import com.example.graduationproject.service.dto.OrderListResponse;
import com.example.graduationproject.service.dto.OrderDetailResponse;
import com.example.graduationproject.service.dto.OrderPricingResult;
import com.example.graduationproject.service.dto.OrderRequest;
import com.example.graduationproject.service.dto.OrderResponse;
import com.example.graduationproject.service.dto.ReturnOrderRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<ApiResponse<OrderResponse>> createOrder(@Valid @RequestBody OrderRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Order created successfully", orderService.createOrder(request)));
    }

    @PostMapping("/preview")
    public ResponseEntity<ApiResponse<OrderPricingResult>> previewOrder(@Valid @RequestBody OrderRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Order preview fetched successfully", orderService.previewOrder(request)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderDetailResponse>> getOrderDetail(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success("Order detail fetched successfully", orderService.getOrderDetail(id)));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<java.util.List<OrderListResponse>>> getOrdersByUser(@PathVariable String userId) {
        return ResponseEntity.ok(ApiResponse.success("User orders fetched successfully", orderService.getOrdersByUserId(userId)));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<Void>> cancelOrder(@PathVariable String id, @RequestParam String userId) {
        orderService.cancelOrder(id, userId);
        return ResponseEntity.ok(ApiResponse.success("Order cancelled successfully", null));
    }

    @PutMapping("/{id}/return")
    public ResponseEntity<ApiResponse<Void>> returnOrder(@PathVariable String id, @RequestParam String userId) {
        orderService.returnOrder(id, userId);
        return ResponseEntity.ok(ApiResponse.success("Order returned successfully", null));
    }

    @PutMapping("/{id}/return-items")
    public ResponseEntity<ApiResponse<OrderDetailResponse>> returnOrderItems(@PathVariable String id, @Valid @RequestBody ReturnOrderRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Order items returned successfully", orderService.returnOrderItems(id, request)));
    }
}
