package com.example.graduationproject.admin.schedule.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminAttendanceResponse {
    private String id;
    private String status;
    private LocalDateTime checkInAt;
    private LocalDateTime checkOutAt;
    private Integer actualWorkMinutes;
    private Integer lateMinutes;
    private Integer earlyLeaveMinutes;
    private Integer overtimeMinutes;
    private String note;
}
