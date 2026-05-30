package com.example.graduationproject.admin.dashboard.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AdminCategoryStatsResponse {
    private final String name;
    private final long value;
}
