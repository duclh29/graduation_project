package com.example.graduationproject.admin.schedule;

import com.example.graduationproject.entity.Shift;
import com.example.graduationproject.entity.User;
import com.example.graduationproject.entity.WorkSchedule;
import com.example.graduationproject.entity.enums.ShiftStatus;
import com.example.graduationproject.entity.enums.UserStatus;
import com.example.graduationproject.exception.BadRequestException;
import com.example.graduationproject.payment.repository.WorkScheduleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ScheduleValidationService {

    private static final long MIN_REST_HOURS_BETWEEN_SHIFTS = 12;

    private final WorkScheduleRepository workScheduleRepository;
    private final ShiftTimeCalculator shiftTimeCalculator;

    public ScheduleTimeWindow validateAssignment(User user, Shift shift, LocalDate workDate) {
        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new BadRequestException("Only active staff can be assigned to a shift");
        }

        if ((shift.getStatus() == null ? ShiftStatus.ACTIVE : shift.getStatus()) != ShiftStatus.ACTIVE) {
            throw new BadRequestException("Only active shifts can be scheduled");
        }

        if (shift.getMaxStaff() != null && workScheduleRepository.countByShiftIdAndWorkDate(shift.getId(), workDate) >= shift.getMaxStaff()) {
            throw new BadRequestException("This shift already reached the maximum number of staff for " + workDate);
        }

        ScheduleTimeWindow candidateWindow = shiftTimeCalculator.calculateWindow(shift, workDate);
        List<WorkSchedule> nearbySchedules = workScheduleRepository.findByUserIdAndWorkDateBetweenOrderByWorkDateAsc(
                user.getId(),
                workDate.minusDays(1),
                workDate.plusDays(1)
        ).stream().sorted(Comparator.comparing(this::resolveStartAt)).toList();

        for (WorkSchedule existing : nearbySchedules) {
            LocalDateTime existingStart = resolveStartAt(existing);
            LocalDateTime existingEnd = resolveEndAt(existing);

            if (overlaps(candidateWindow.startAt(), candidateWindow.endAt(), existingStart, existingEnd)) {
                throw new BadRequestException("This staff already has another shift that overlaps with the selected time");
            }

            if (candidateWindow.endAt().isBefore(existingStart) || candidateWindow.endAt().isEqual(existingStart)) {
                long restHours = Duration.between(candidateWindow.endAt(), existingStart).toHours();
                if (restHours < MIN_REST_HOURS_BETWEEN_SHIFTS) {
                    throw new BadRequestException("The staff must have at least 12 hours of rest before the next shift");
                }
            }

            if (existingEnd.isBefore(candidateWindow.startAt()) || existingEnd.isEqual(candidateWindow.startAt())) {
                long restHours = Duration.between(existingEnd, candidateWindow.startAt()).toHours();
                if (restHours < MIN_REST_HOURS_BETWEEN_SHIFTS) {
                    throw new BadRequestException("The staff must have at least 12 hours of rest between consecutive shifts");
                }
            }
        }

        return candidateWindow;
    }

    private LocalDateTime resolveStartAt(WorkSchedule schedule) {
        return schedule.getPlannedStartAt() != null
                ? schedule.getPlannedStartAt()
                : shiftTimeCalculator.calculateWindow(schedule.getShift(), schedule.getWorkDate()).startAt();
    }

    private LocalDateTime resolveEndAt(WorkSchedule schedule) {
        return schedule.getPlannedEndAt() != null
                ? schedule.getPlannedEndAt()
                : shiftTimeCalculator.calculateWindow(schedule.getShift(), schedule.getWorkDate()).endAt();
    }

    private boolean overlaps(LocalDateTime start1, LocalDateTime end1, LocalDateTime start2, LocalDateTime end2) {
        return start1.isBefore(end2) && start2.isBefore(end1);
    }
}
