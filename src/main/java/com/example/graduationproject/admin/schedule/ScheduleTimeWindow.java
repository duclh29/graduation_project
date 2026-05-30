package com.example.graduationproject.admin.schedule;

import java.time.LocalDateTime;

public record ScheduleTimeWindow(LocalDateTime startAt, LocalDateTime endAt, long paidWorkMinutes) {
}
