package com.example.graduationproject.admin.schedule;

import com.example.graduationproject.entity.Shift;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Component
public class ShiftTimeCalculator {

    public boolean isCrossDay(Shift shift) {
        return Boolean.TRUE.equals(shift.getCrossDay()) || !shift.getEndTime().isAfter(shift.getStartTime());
    }

    public ScheduleTimeWindow calculateWindow(Shift shift, LocalDate workDate) {
        LocalDateTime startAt = LocalDateTime.of(workDate, shift.getStartTime());
        LocalDateTime endAt = LocalDateTime.of(isCrossDay(shift) ? workDate.plusDays(1) : workDate, shift.getEndTime());
        long durationMinutes = Duration.between(startAt, endAt).toMinutes();
        long paidWorkMinutes = durationMinutes - (shift.getBreakMinutes() == null ? 0 : shift.getBreakMinutes());
        return new ScheduleTimeWindow(startAt, endAt, Math.max(paidWorkMinutes, 0));
    }
}
