package com.example.graduationproject.admin.schedule.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminAttendanceRequest {
    @NotBlank(message = "Attendance status is required")
    private String status;

    private LocalDateTime checkInAt;

    private LocalDateTime checkOutAt;

    private String note;
}
