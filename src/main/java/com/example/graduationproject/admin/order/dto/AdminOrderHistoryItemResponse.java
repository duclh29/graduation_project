package com.example.graduationproject.admin.order.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class AdminOrderHistoryItemResponse {
    private String id;
    private String status;
    private String note;
    private String actorName;
    private LocalDateTime changedAt;
}
