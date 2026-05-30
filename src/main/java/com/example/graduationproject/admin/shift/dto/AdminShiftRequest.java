package com.example.graduationproject.admin.shift.dto;

import com.example.graduationproject.entity.enums.ShiftStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminShiftRequest {
    @NotBlank(message = "Shift code is required")
    private String code;

    @NotBlank(message = "Shift name is required")
    private String name;

    @NotNull(message = "Start time is required")
    private LocalTime startTime;

    @NotNull(message = "End time is required")
    private LocalTime endTime;

    private Boolean crossDay;

    @NotNull(message = "Break minutes is required")
    @PositiveOrZero(message = "Break minutes must be zero or greater")
    private Integer breakMinutes;

    @NotNull(message = "Paid break minutes is required")
    @PositiveOrZero(message = "Paid break minutes must be zero or greater")
    private Integer paidBreakMinutes;

    @NotNull(message = "Minimum staff is required")
    @PositiveOrZero(message = "Minimum staff must be zero or greater")
    private Integer minStaff;

    @NotNull(message = "Maximum staff is required")
    @Positive(message = "Maximum staff must be greater than zero")
    private Integer maxStaff;

    @NotNull(message = "Shift status is required")
    private ShiftStatus status;

    private String description;
}
