package com.example.graduationproject.admin.schedule.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminScheduleSwapDecisionRequest {
    private String reviewNote;
}
