package com.example.graduationproject.service.dto;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OrderRequest {

    @NotNull(message = "User id is required")
    private String userId;

    @Valid
    @NotEmpty(message = "Order items are required")
    private List<OrderItemRequest> items;

    private String couponCode;

    private String addressId;

    private String recipientName;
    private String phoneNumber;
    private String addressLine;
    private String ward;
    private String district;
    private String city;
    private String country;
    private String postalCode;
    
    private String paymentMethod;
    private String note;
    private java.math.BigDecimal shippingFee;
}
