package com.example.graduationproject.shipping.dto;

import com.example.graduationproject.entity.enums.ShippingStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateShippingStatusRequest {
    @NotNull
    private ShippingStatus status;
}
