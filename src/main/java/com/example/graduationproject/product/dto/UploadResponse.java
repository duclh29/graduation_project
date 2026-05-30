package com.example.graduationproject.product.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class UploadResponse {
    private final String fileName;
    private final String filePath;
}
