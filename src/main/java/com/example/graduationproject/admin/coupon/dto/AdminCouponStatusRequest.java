package com.example.graduationproject.admin.coupon.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminCouponStatusRequest {
    @NotBlank(message = "Status is required")
    private String status;
}
