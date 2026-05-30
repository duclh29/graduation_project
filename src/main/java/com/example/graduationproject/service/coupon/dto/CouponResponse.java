package com.example.graduationproject.service.coupon.dto;

import com.example.graduationproject.entity.enums.CouponType;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class CouponResponse {
    private String id;
    private String code;
    private String description;
    private CouponType type;
    private BigDecimal discountValue;
    private BigDecimal maxDiscountValue;
    private BigDecimal minimumOrderAmount;
    private LocalDateTime startAt;
    private LocalDateTime endAt;
}
