package com.example.graduationproject.admin.pos.dto;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminPosReturnExchangeRequest {
    @Valid
    private List<AdminPosReturnExchangeItemRequest> returnItems;

    @Valid
    private List<AdminPosOrderItemRequest> exchangeItems;

    private String paymentMethod;

    private String note;
}
