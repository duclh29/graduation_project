package com.example.graduationproject.admin.schedule.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminScheduleBulkRequest {
    @Valid
    @NotEmpty(message = "Schedule items are required")
    private List<AdminScheduleRequest> items;
}
