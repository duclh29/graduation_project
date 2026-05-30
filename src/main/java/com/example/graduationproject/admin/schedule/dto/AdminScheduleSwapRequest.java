package com.example.graduationproject.admin.schedule.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminScheduleSwapRequest {
    @NotNull(message = "Schedule ID is required")
    private String scheduleId;

    @NotNull(message = "Target user ID is required")
    private String targetUserId;

    private String note;
}
