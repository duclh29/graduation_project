package com.example.graduationproject.admin.product.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class AdminProductMetaResponse {
    private final List<AdminLookupItemResponse> brands;
    private final List<AdminLookupItemResponse> categories;
    private final List<AdminLookupItemResponse> sizes;
}
