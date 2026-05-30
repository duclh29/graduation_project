package com.example.graduationproject.admin.promotion.dto;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class AdminPromotionListItemResponse {
    private final String id;
    private final String name;
    private final String code;
    private final String description;
    private final String type;
    private final String status;
    private final BigDecimal discountValue;
    private final BigDecimal maxDiscountValue;
    private final LocalDateTime startAt;
    private final LocalDateTime endAt;
    private final List<String> productIds;
    private final List<String> variantIds;
}
