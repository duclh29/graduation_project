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
public class AdminScheduleCopyWeekRequest {
    @NotNull(message = "Source week start date is required")
    private LocalDate sourceStartDate;

    @NotNull(message = "Target week start date is required")
    private LocalDate targetStartDate;
}
