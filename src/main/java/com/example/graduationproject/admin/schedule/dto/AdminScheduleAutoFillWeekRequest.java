package com.example.graduationproject.admin.schedule.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminScheduleAutoFillWeekRequest {
    @NotNull(message = "Week start date is required")
    private LocalDate weekStartDate;
}
