package com.example.graduationproject.service.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AddressResponse {
    private final String id;
    private final String recipientName;
    private final String phoneNumber;
    private final String addressLine;
    private final String ward;
    private final String district;
    private final String city;
    private final String country;
    private final String postalCode;
}

