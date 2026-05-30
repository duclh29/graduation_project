package com.example.graduationproject.admin.schedule.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminOpenShiftAssignRequest {
    @NotNull(message = "User ID is required")
    private String userId;

    private String note;
}
