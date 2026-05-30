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
public class AdminOpenShiftRequest {
    @NotNull(message = "Shift ID is required")
    private String shiftId;

    @NotNull(message = "Work date is required")
    private LocalDate workDate;

    private String note;
}
