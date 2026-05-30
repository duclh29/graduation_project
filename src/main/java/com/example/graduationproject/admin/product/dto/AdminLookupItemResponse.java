package com.example.graduationproject.admin.product.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AdminLookupItemResponse {
    private final String id;
    private final String name;
}
