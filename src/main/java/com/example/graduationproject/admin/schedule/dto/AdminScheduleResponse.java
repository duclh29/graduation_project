package com.example.graduationproject.admin.schedule.dto;

import com.example.graduationproject.entity.enums.SchedulePublishStatus;
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
public class AdminScheduleResponse {
    private String id;
    private String userId;
    private String userFullName;
    private String shiftId;
    private String shiftName;
    private String startTime;
    private String endTime;
    private LocalDate workDate;
    private String status;
    private SchedulePublishStatus publishStatus;
    private LocalDateTime plannedStartAt;
    private LocalDateTime plannedEndAt;
    private String note;
    private AdminAttendanceResponse attendance;
}
