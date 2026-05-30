package com.example.graduationproject.admin.promotion.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminPromotionStatusRequest {
    @NotBlank(message = "Promotion status is required")
    private String status;
}
