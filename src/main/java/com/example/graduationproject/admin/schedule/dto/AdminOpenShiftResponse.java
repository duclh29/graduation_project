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
public class AdminOpenShiftResponse {
    private String id;
    private String shiftId;
    private String shiftName;
    private LocalDate workDate;
    private LocalDateTime plannedStartAt;
    private LocalDateTime plannedEndAt;
    private String status;
    private String assignedUserId;
    private String assignedUserFullName;
    private String scheduleId;
    private String note;
}
