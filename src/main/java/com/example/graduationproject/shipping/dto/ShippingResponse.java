package com.example.graduationproject.shipping.dto;

import com.example.graduationproject.entity.enums.ShippingStatus;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ShippingResponse {
    private final String shippingId;
    private final String orderId;
    private final ShippingStatus status;
    private final String trackingNumber;
}
