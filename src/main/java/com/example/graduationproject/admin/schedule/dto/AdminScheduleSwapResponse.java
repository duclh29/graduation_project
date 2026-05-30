package com.example.graduationproject.admin.schedule.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminScheduleSwapResponse {
    private String id;
    private String scheduleId;
    private String shiftId;
    private String shiftName;
    private LocalDate workDate;
    private String fromUserId;
    private String fromUserFullName;
    private String targetUserId;
    private String targetUserFullName;
    private String status;
    private String note;
    private String reviewNote;
    private LocalDateTime reviewedAt;
}
