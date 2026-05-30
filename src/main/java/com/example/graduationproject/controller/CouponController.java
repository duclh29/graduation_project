package com.example.graduationproject.controller;

import com.example.graduationproject.common.api.ApiResponse;
import com.example.graduationproject.service.coupon.CouponService;
import com.example.graduationproject.service.coupon.dto.CouponResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/coupons")
@RequiredArgsConstructor
public class CouponController {

    private final CouponService couponService;

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<CouponResponse>>> getActivePublicCoupons() {
        return ResponseEntity.ok(ApiResponse.success(
                "Active coupons fetched successfully",
                couponService.getActivePublicCoupons()
        ));
    }

    @PostMapping("/{code}/save")
    public ResponseEntity<ApiResponse<Void>> saveCoupon(
            @PathVariable String code,
            @RequestParam String userId) {
        couponService.saveCouponForUser(code, userId);
        return ResponseEntity.ok(ApiResponse.success("Coupon saved successfully", null));
    }

    @GetMapping("/saved")
    public ResponseEntity<ApiResponse<List<CouponResponse>>> getSavedCoupons(
            @RequestParam String userId) {
        return ResponseEntity.ok(ApiResponse.success(
                "Saved coupons fetched successfully",
                couponService.getSavedCouponsForUser(userId)
        ));
    }

}
