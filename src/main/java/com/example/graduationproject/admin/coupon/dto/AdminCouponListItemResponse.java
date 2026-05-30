package com.example.graduationproject.admin.coupon.dto;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Builder
public class AdminCouponListItemResponse {
    private String id;
    private String code;
    private String description;
    private String type;
    private BigDecimal discountValue;
    private BigDecimal maxDiscountValue;
    private BigDecimal minimumOrderAmount;
    private Integer usageLimit;
    private Integer usedCount;
    private String status;
    private LocalDateTime startAt;
    private LocalDateTime endAt;
}
