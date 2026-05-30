package com.example.graduationproject.admin.order.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminUpdateOrderStatusRequest {
    @NotBlank(message = "Order status is required")
    private String status;

    private String note;
}
