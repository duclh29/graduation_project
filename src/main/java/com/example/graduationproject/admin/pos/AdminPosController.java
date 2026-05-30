package com.example.graduationproject.admin.pos;

import com.example.graduationproject.admin.pos.dto.AdminPosCashierSessionRequest;
import com.example.graduationproject.admin.pos.dto.AdminPosCashierSessionResponse;
import com.example.graduationproject.admin.pos.dto.AdminPosCouponPreviewResponse;
import com.example.graduationproject.admin.pos.dto.AdminPosCreateOrderRequest;
import com.example.graduationproject.admin.pos.dto.AdminPosOrderResponse;
import com.example.graduationproject.admin.pos.dto.AdminPosReturnExchangeRequest;
import com.example.graduationproject.admin.pos.dto.AdminPosReturnExchangeResponse;
import com.example.graduationproject.admin.pos.dto.AdminPosVariantLookupResponse;
import com.example.graduationproject.common.api.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/pos")
@RequiredArgsConstructor
public class AdminPosController {

    private final AdminPosService adminPosService;

    @PostMapping("/orders")
    public ResponseEntity<ApiResponse<AdminPosOrderResponse>> createCounterOrder(@Valid @RequestBody AdminPosCreateOrderRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("POS order created successfully", adminPosService.createCounterOrder(request)));
    }

    @PostMapping("/coupons/preview")
    public ResponseEntity<ApiResponse<AdminPosCouponPreviewResponse>> previewCoupon(@Valid @RequestBody AdminPosCreateOrderRequest request) {
        return ResponseEntity.ok(ApiResponse.success("POS coupon preview calculated successfully", adminPosService.previewCoupon(request)));
    }

    @GetMapping("/orders")
    public ResponseEntity<ApiResponse<Page<AdminPosOrderResponse>>> getPosOrders(
            @RequestParam(name = "keyword", required = false) String keyword,
            Pageable pageable
    ) {
        return ResponseEntity.ok(ApiResponse.success("POS orders fetched successfully", adminPosService.getPosOrders(keyword, pageable)));
    }

    @GetMapping("/orders/{id}")
    public ResponseEntity<ApiResponse<AdminPosOrderResponse>> getPosOrder(@PathVariable("id") String id) {
        return ResponseEntity.ok(ApiResponse.success("POS order fetched successfully", adminPosService.getPosOrder(id)));
    }

    @PostMapping("/orders/{id}/return-exchange")
    public ResponseEntity<ApiResponse<AdminPosReturnExchangeResponse>> returnOrExchange(
            @PathVariable("id") String id,
            @Valid @RequestBody AdminPosReturnExchangeRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success("POS return/exchange processed successfully", adminPosService.returnOrExchange(id, request)));
    }

    @GetMapping("/variants/lookup")
    public ResponseEntity<ApiResponse<AdminPosVariantLookupResponse>> lookupVariant(@RequestParam("code") String code) {
        return ResponseEntity.ok(ApiResponse.success("POS variant fetched successfully", adminPosService.lookupVariant(code)));
    }

    @GetMapping("/cashier-sessions/current")
    public ResponseEntity<ApiResponse<AdminPosCashierSessionResponse>> getCurrentSession() {
        return ResponseEntity.ok(ApiResponse.success("Current POS cashier session fetched successfully", adminPosService.getCurrentSession()));
    }

    @PostMapping("/cashier-sessions")
    public ResponseEntity<ApiResponse<AdminPosCashierSessionResponse>> openSession(@Valid @RequestBody AdminPosCashierSessionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("POS cashier session opened successfully", adminPosService.openSession(request)));
    }

    @PostMapping("/cashier-sessions/{id}/close")
    public ResponseEntity<ApiResponse<AdminPosCashierSessionResponse>> closeSession(
            @PathVariable("id") String id,
            @Valid @RequestBody AdminPosCashierSessionRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success("POS cashier session closed successfully", adminPosService.closeSession(id, request)));
    }
}
