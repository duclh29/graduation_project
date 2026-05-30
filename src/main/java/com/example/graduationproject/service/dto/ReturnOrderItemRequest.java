package com.example.graduationproject.service.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ReturnOrderItemRequest {
    @NotNull
    private String orderItemId;

    @NotNull
    @Min(1)
    private Integer quantity;
}
