package com.example.graduationproject.service.dto;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ReturnOrderRequest {
    @NotNull
    private String userId;

    private String note;

    @Valid
    @NotEmpty
    private List<ReturnOrderItemRequest> items;
}
