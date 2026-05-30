package com.example.graduationproject.admin.shift.dto;

import com.example.graduationproject.entity.enums.ShiftStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminShiftResponse {
    private String id;
    private String code;
    private String name;
    private LocalTime startTime;
    private LocalTime endTime;
    private Boolean crossDay;
    private Integer breakMinutes;
    private Integer paidBreakMinutes;
    private Integer minStaff;
    private Integer maxStaff;
    private ShiftStatus status;
    private String description;
}
