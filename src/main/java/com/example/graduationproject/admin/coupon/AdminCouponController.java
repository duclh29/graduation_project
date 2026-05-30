package com.example.graduationproject.admin.coupon;

import com.example.graduationproject.admin.coupon.dto.AdminCouponListItemResponse;
import com.example.graduationproject.admin.coupon.dto.AdminCouponStatusRequest;
import com.example.graduationproject.admin.coupon.dto.AdminCouponUpsertRequest;
import com.example.graduationproject.common.api.ApiResponse;
import com.example.graduationproject.common.api.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
@RequestMapping("/api/admin/coupons")
@RequiredArgsConstructor
public class AdminCouponController {

    private final AdminCouponService adminCouponService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<AdminCouponListItemResponse>>> getCoupons(
            @RequestParam(name = "keyword", required = false) String keyword,
            @RequestParam(name = "status", required = false) String status,
            Pageable pageable
    ) {
        return ResponseEntity.ok(ApiResponse.success("Admin coupons fetched successfully", PageResponse.from(adminCouponService.getCoupons(keyword, status, pageable))));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AdminCouponListItemResponse>> getCoupon(@PathVariable("id") String id) {
        return ResponseEntity.ok(ApiResponse.success("Admin coupon detail fetched successfully", adminCouponService.getCoupon(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AdminCouponListItemResponse>> createCoupon(@Valid @RequestBody AdminCouponUpsertRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Admin coupon created successfully", adminCouponService.createCoupon(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AdminCouponListItemResponse>> updateCoupon(@PathVariable("id") String id,
                                                                                  @Valid @RequestBody AdminCouponUpsertRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Admin coupon updated successfully", adminCouponService.updateCoupon(id, request)));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<AdminCouponListItemResponse>> updateStatus(@PathVariable("id") String id,
                                                                                  @Valid @RequestBody AdminCouponStatusRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Admin coupon status updated successfully", adminCouponService.updateStatus(id, request)));
    }
}
