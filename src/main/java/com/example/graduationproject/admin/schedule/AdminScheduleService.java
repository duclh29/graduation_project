package com.example.graduationproject.admin.schedule;

import com.example.graduationproject.admin.schedule.dto.AdminAttendanceRequest;
import com.example.graduationproject.admin.schedule.dto.AdminAttendanceResponse;
import com.example.graduationproject.admin.schedule.dto.AdminOpenShiftAssignRequest;
import com.example.graduationproject.admin.schedule.dto.AdminOpenShiftRequest;
import com.example.graduationproject.admin.schedule.dto.AdminOpenShiftResponse;
import com.example.graduationproject.admin.schedule.dto.AdminScheduleAutoFillWeekRequest;
import com.example.graduationproject.admin.schedule.dto.AdminScheduleBulkRequest;
import com.example.graduationproject.admin.schedule.dto.AdminScheduleCopyWeekRequest;
import com.example.graduationproject.admin.schedule.dto.AdminScheduleRangeRequest;
import com.example.graduationproject.admin.schedule.dto.AdminScheduleRequest;
import com.example.graduationproject.admin.schedule.dto.AdminScheduleResponse;
import com.example.graduationproject.admin.schedule.dto.AdminScheduleSwapDecisionRequest;
import com.example.graduationproject.admin.schedule.dto.AdminScheduleSwapRequest;
import com.example.graduationproject.admin.schedule.dto.AdminScheduleSwapResponse;
import com.example.graduationproject.entity.AttendanceRecord;
import com.example.graduationproject.entity.OpenShift;
import com.example.graduationproject.entity.ScheduleSwapRequest;
import com.example.graduationproject.entity.Shift;
import com.example.graduationproject.entity.User;
import com.example.graduationproject.entity.WorkSchedule;
import com.example.graduationproject.entity.enums.AttendanceSource;
import com.example.graduationproject.entity.enums.AttendanceStatus;
import com.example.graduationproject.entity.enums.OpenShiftStatus;
import com.example.graduationproject.entity.enums.RoleName;
import com.example.graduationproject.entity.enums.SchedulePublishStatus;
import com.example.graduationproject.entity.enums.ScheduleSwapRequestStatus;
import com.example.graduationproject.entity.enums.ShiftStatus;
import com.example.graduationproject.entity.enums.UserStatus;
import com.example.graduationproject.exception.BadRequestException;
import com.example.graduationproject.exception.NotFoundException;
import com.example.graduationproject.payment.repository.AttendanceRecordRepository;
import com.example.graduationproject.payment.repository.OpenShiftRepository;
import com.example.graduationproject.payment.repository.ScheduleSwapRequestRepository;
import com.example.graduationproject.payment.repository.ShiftRepository;
import com.example.graduationproject.payment.repository.UserRepository;
import com.example.graduationproject.payment.repository.WorkScheduleRepository;
import com.example.graduationproject.payment.repository.ScheduleChangeLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminScheduleService {

    private final WorkScheduleRepository scheduleRepository;
    private final UserRepository userRepository;
    private final ShiftRepository shiftRepository;
    private final ScheduleValidationService scheduleValidationService;
    private final ShiftTimeCalculator shiftTimeCalculator;
    private final AttendanceRecordRepository attendanceRecordRepository;
    private final OpenShiftRepository openShiftRepository;
    private final ScheduleSwapRequestRepository scheduleSwapRequestRepository;
    private final ScheduleChangeLogRepository scheduleChangeLogRepository;
    private final ScheduleAuditService scheduleAuditService;

    @Transactional(readOnly = true)
    public List<AdminScheduleResponse> getSchedulesBetween(LocalDate startDate, LocalDate endDate) {
        if (startDate.isAfter(endDate)) {
            throw new BadRequestException("Start date cannot be after end date");
        }
        return scheduleRepository.findSchedulesBetweenDates(startDate, endDate)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public AdminScheduleResponse assignSchedule(AdminScheduleRequest request) {
        User user = userRepository.findAdminUserById(request.getUserId(), RoleName.STAFF)
                .orElseThrow(() -> new NotFoundException("Staff not found with id: " + request.getUserId()));

        Shift shift = shiftRepository.findById(request.getShiftId())
                .orElseThrow(() -> new NotFoundException("Shift not found with id: " + request.getShiftId()));

        ScheduleTimeWindow scheduleTimeWindow = scheduleValidationService.validateAssignment(user, shift, request.getWorkDate());

        WorkSchedule schedule = WorkSchedule.builder()
                .user(user)
                .shift(shift)
                .workDate(request.getWorkDate())
                .plannedStartAt(scheduleTimeWindow.startAt())
                .plannedEndAt(scheduleTimeWindow.endAt())
                .status(AttendanceStatus.SCHEDULED)
                .publishStatus(SchedulePublishStatus.DRAFT)
                .note(request.getNote())
                .build();

        scheduleRepository.save(schedule);
        scheduleAuditService.record(schedule, "SCHEDULE_CREATED", null, scheduleSnapshot(schedule));
        return toResponse(schedule);
    }

    @Transactional
    public List<AdminScheduleResponse> assignSchedulesBulk(AdminScheduleBulkRequest request) {
        return request.getItems().stream()
                .map(this::assignSchedule)
                .collect(Collectors.toList());
    }

    @Transactional
    public List<AdminScheduleResponse> copyWeek(AdminScheduleCopyWeekRequest request) {
        if (request.getSourceStartDate().equals(request.getTargetStartDate())) {
            throw new BadRequestException("Target week must be different from source week");
        }

        LocalDate sourceEndDate = request.getSourceStartDate().plusDays(6);
        LocalDate targetEndDate = request.getTargetStartDate().plusDays(6);
        List<WorkSchedule> sourceSchedules = scheduleRepository.findSchedulesBetweenDates(request.getSourceStartDate(), sourceEndDate);
        if (sourceSchedules.isEmpty()) {
            return List.of();
        }

        List<WorkSchedule> copiedSchedules = new java.util.ArrayList<>();
        for (WorkSchedule sourceSchedule : sourceSchedules) {
            long offsetDays = ChronoUnit.DAYS.between(request.getSourceStartDate(), sourceSchedule.getWorkDate());
            LocalDate targetWorkDate = request.getTargetStartDate().plusDays(offsetDays);
            if (scheduleRepository.existsByUserIdAndShiftIdAndWorkDate(
                    sourceSchedule.getUser().getId(),
                    sourceSchedule.getShift().getId(),
                    targetWorkDate
            )) {
                continue;
            }

            ScheduleTimeWindow scheduleTimeWindow = scheduleValidationService.validateAssignment(
                    sourceSchedule.getUser(),
                    sourceSchedule.getShift(),
                    targetWorkDate
            );
            WorkSchedule copiedSchedule = WorkSchedule.builder()
                    .user(sourceSchedule.getUser())
                    .shift(sourceSchedule.getShift())
                    .workDate(targetWorkDate)
                    .plannedStartAt(scheduleTimeWindow.startAt())
                    .plannedEndAt(scheduleTimeWindow.endAt())
                    .status(AttendanceStatus.SCHEDULED)
                    .publishStatus(SchedulePublishStatus.DRAFT)
                    .note(sourceSchedule.getNote())
                    .build();

            scheduleRepository.save(copiedSchedule);
            scheduleAuditService.record(
                    copiedSchedule,
                    "SCHEDULE_WEEK_COPIED",
                    scheduleSnapshot(sourceSchedule),
                    scheduleSnapshot(copiedSchedule)
            );
            copiedSchedules.add(copiedSchedule);
        }

        validateDateRange(request.getTargetStartDate(), targetEndDate);
        return copiedSchedules.stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public List<AdminScheduleResponse> autoFillWeek(AdminScheduleAutoFillWeekRequest request) {
        LocalDate weekStartDate = request.getWeekStartDate();
        LocalDate weekEndDate = weekStartDate.plusDays(6);
        validateDateRange(weekStartDate, weekEndDate);

        List<User> activeStaffs = userRepository.searchAdminUsers(null, UserStatus.ACTIVE, RoleName.STAFF, Pageable.unpaged()).getContent();
        if (activeStaffs.isEmpty()) {
            throw new BadRequestException("Cannot auto-fill schedule because there are no active staff");
        }

        List<Shift> activeShifts = shiftRepository.findByStatusOrderByStartTimeAsc(ShiftStatus.ACTIVE);
        if (activeShifts.isEmpty()) {
            throw new BadRequestException("Cannot auto-fill schedule because there are no active shifts");
        }

        List<WorkSchedule> createdSchedules = new java.util.ArrayList<>();
        int staffCursor = 0;
        for (int dayOffset = 0; dayOffset < 7; dayOffset++) {
            LocalDate workDate = weekStartDate.plusDays(dayOffset);
            for (Shift shift : activeShifts) {
                int requiredStaff = Math.max(1, shift.getMinStaff() == null ? 1 : shift.getMinStaff());
                long existingCount = scheduleRepository.countByShiftIdAndWorkDate(shift.getId(), workDate);
                int remaining = (int) Math.max(0, requiredStaff - existingCount);

                for (int slot = 0; slot < remaining; slot++) {
                    WorkSchedule created = tryCreateAutoSchedule(activeStaffs, staffCursor, shift, workDate);
                    if (created == null) {
                        break;
                    }
                    createdSchedules.add(created);
                    staffCursor = (activeStaffs.indexOf(created.getUser()) + 1) % activeStaffs.size();
                }
            }
        }

        return createdSchedules.stream().map(this::toResponse).collect(Collectors.toList());
    }

    private WorkSchedule tryCreateAutoSchedule(List<User> activeStaffs, int staffCursor, Shift shift, LocalDate workDate) {
        for (int attempt = 0; attempt < activeStaffs.size(); attempt++) {
            User staff = activeStaffs.get((staffCursor + attempt) % activeStaffs.size());
            if (scheduleRepository.existsByUserIdAndShiftIdAndWorkDate(staff.getId(), shift.getId(), workDate)) {
                continue;
            }

            try {
                ScheduleTimeWindow scheduleTimeWindow = scheduleValidationService.validateAssignment(staff, shift, workDate);
                WorkSchedule schedule = WorkSchedule.builder()
                        .user(staff)
                        .shift(shift)
                        .workDate(workDate)
                        .plannedStartAt(scheduleTimeWindow.startAt())
                        .plannedEndAt(scheduleTimeWindow.endAt())
                        .status(AttendanceStatus.SCHEDULED)
                        .publishStatus(SchedulePublishStatus.DRAFT)
                        .note("Auto-filled weekly schedule")
                        .build();
                scheduleRepository.save(schedule);
                scheduleAuditService.record(schedule, "SCHEDULE_WEEK_AUTOFILLED", null, scheduleSnapshot(schedule));
                return schedule;
            } catch (BadRequestException ignored) {
                // Try the next staff member when this candidate violates rest, overlap, or max-staff rules.
            }
        }
        return null;
    }

    @Transactional
    public List<AdminScheduleResponse> publishSchedules(AdminScheduleRangeRequest request) {
        validateDateRange(request.getStartDate(), request.getEndDate());

        List<WorkSchedule> schedules = scheduleRepository.findSchedulesBetweenDates(request.getStartDate(), request.getEndDate());
        if (schedules.isEmpty()) {
            return List.of();
        }

        Map<String, List<WorkSchedule>> schedulesByShiftDate = schedules.stream()
                .collect(Collectors.groupingBy(schedule -> schedule.getShift().getId() + ":" + schedule.getWorkDate()));

        schedulesByShiftDate.forEach((key, items) -> {
            Shift shift = items.getFirst().getShift();
            if (shift.getMinStaff() != null && items.size() < shift.getMinStaff()) {
                throw new BadRequestException("Cannot publish schedules because shift " + shift.getName()
                        + " on " + items.getFirst().getWorkDate() + " does not meet minimum staff");
            }
        });

        LocalDateTime publishedAt = LocalDateTime.now();
        List<WorkSchedule> draftSchedules = schedules.stream()
                .filter(schedule -> resolvePublishStatus(schedule) == SchedulePublishStatus.DRAFT)
                .toList();

        draftSchedules.forEach(schedule -> {
            String oldValue = scheduleSnapshot(schedule);
            schedule.setPublishStatus(SchedulePublishStatus.PUBLISHED);
            schedule.setPublishedAt(publishedAt);
            scheduleAuditService.record(schedule, "SCHEDULE_PUBLISHED", oldValue, scheduleSnapshot(schedule));
        });

        scheduleRepository.saveAll(draftSchedules);
        return draftSchedules.stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public List<AdminScheduleResponse> lockSchedules(AdminScheduleRangeRequest request) {
        validateDateRange(request.getStartDate(), request.getEndDate());

        List<WorkSchedule> publishedSchedules = scheduleRepository.findByWorkDateBetweenAndPublishStatusOrderByWorkDateAsc(
                request.getStartDate(),
                request.getEndDate(),
                SchedulePublishStatus.PUBLISHED
        );

        LocalDateTime lockedAt = LocalDateTime.now();
        publishedSchedules.forEach(schedule -> {
            String oldValue = scheduleSnapshot(schedule);
            schedule.setPublishStatus(SchedulePublishStatus.LOCKED);
            schedule.setLockedAt(lockedAt);
            scheduleAuditService.record(schedule, "SCHEDULE_LOCKED", oldValue, scheduleSnapshot(schedule));
        });

        scheduleRepository.saveAll(publishedSchedules);
        return publishedSchedules.stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public AdminScheduleResponse updateAttendance(String id, AdminAttendanceRequest request) {
        WorkSchedule schedule = scheduleRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Schedule not found with id: " + id));

        if (resolvePublishStatus(schedule) == SchedulePublishStatus.DRAFT) {
            throw new BadRequestException("Attendance can only be updated after the schedule has been published");
        }

        AttendanceStatus attendanceStatus;
        try {
            attendanceStatus = AttendanceStatus.valueOf(request.getStatus().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid attendance status: " + request.getStatus());
        }

        String oldValue = scheduleSnapshot(schedule);
        AttendanceRecord attendanceRecord = attendanceRecordRepository.findByScheduleId(schedule.getId())
                .orElseGet(() -> AttendanceRecord.builder().schedule(schedule).build());

        attendanceRecord.setStatus(attendanceStatus);
        attendanceRecord.setCheckInAt(request.getCheckInAt());
        attendanceRecord.setCheckOutAt(request.getCheckOutAt());
        attendanceRecord.setSource(AttendanceSource.ADMIN);
        attendanceRecord.setNote(request.getNote());
        attendanceRecord.setApprovedAt(LocalDateTime.now());
        applyAttendanceMetrics(schedule, attendanceRecord);

        schedule.setStatus(attendanceStatus);
        attendanceRecordRepository.save(attendanceRecord);
        scheduleRepository.save(schedule);
        scheduleAuditService.record(schedule, "ATTENDANCE_UPDATED", oldValue, scheduleSnapshot(schedule));
        return toResponse(schedule);
    }

    @Transactional
    public void deleteSchedule(String id) {
        WorkSchedule schedule = scheduleRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Schedule not found with id: " + id));

        if (resolvePublishStatus(schedule) == SchedulePublishStatus.LOCKED) {
            throw new BadRequestException("Locked schedules cannot be deleted");
        }

        String oldValue = scheduleSnapshot(schedule);
        attendanceRecordRepository.deleteByScheduleId(schedule.getId());
        scheduleSwapRequestRepository.deleteByScheduleId(schedule.getId());
        openShiftRepository.findByScheduleId(schedule.getId()).ifPresent(openShift -> {
            String oldOpenShiftValue = openShiftSnapshot(openShift);
            openShift.setSchedule(null);
            openShift.setAssignedUser(null);
            openShift.setAssignedAt(null);
            openShift.setStatus(OpenShiftStatus.OPEN);
            openShiftRepository.save(openShift);
            scheduleAuditService.record(openShift, "OPEN_SHIFT_UNASSIGNED_BY_SCHEDULE_DELETE", oldOpenShiftValue, openShiftSnapshot(openShift));
        });
        scheduleChangeLogRepository.findByScheduleId(schedule.getId()).forEach(log -> {
            log.setSchedule(null);
            scheduleChangeLogRepository.save(log);
        });
        scheduleRepository.delete(schedule);
        scheduleAuditService.recordDetached("SCHEDULE_DELETED", oldValue, null);
    }

    @Transactional(readOnly = true)
    public List<AdminOpenShiftResponse> getOpenShifts(LocalDate startDate, LocalDate endDate) {
        validateDateRange(startDate, endDate);
        return openShiftRepository.findByWorkDateBetweenOrderByWorkDateAsc(startDate, endDate)
                .stream()
                .map(this::toOpenShiftResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public AdminOpenShiftResponse createOpenShift(AdminOpenShiftRequest request) {
        Shift shift = shiftRepository.findById(request.getShiftId())
                .orElseThrow(() -> new NotFoundException("Shift not found with id: " + request.getShiftId()));
        ScheduleTimeWindow scheduleTimeWindow = shiftTimeCalculator.calculateWindow(shift, request.getWorkDate());

        OpenShift openShift = OpenShift.builder()
                .shift(shift)
                .workDate(request.getWorkDate())
                .plannedStartAt(scheduleTimeWindow.startAt())
                .plannedEndAt(scheduleTimeWindow.endAt())
                .status(OpenShiftStatus.OPEN)
                .note(request.getNote())
                .build();

        openShiftRepository.save(openShift);
        scheduleAuditService.record(openShift, "OPEN_SHIFT_CREATED", null, openShiftSnapshot(openShift));
        return toOpenShiftResponse(openShift);
    }

    @Transactional
    public AdminOpenShiftResponse assignOpenShift(String id, AdminOpenShiftAssignRequest request) {
        OpenShift openShift = openShiftRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Open shift not found with id: " + id));
        if (openShift.getStatus() != OpenShiftStatus.OPEN) {
            throw new BadRequestException("Only open shifts can be assigned");
        }

        User user = userRepository.findAdminUserById(request.getUserId(), RoleName.STAFF)
                .orElseThrow(() -> new NotFoundException("Staff not found with id: " + request.getUserId()));
        ScheduleTimeWindow scheduleTimeWindow = scheduleValidationService.validateAssignment(user, openShift.getShift(), openShift.getWorkDate());

        String oldValue = openShiftSnapshot(openShift);
        WorkSchedule schedule = WorkSchedule.builder()
                .user(user)
                .shift(openShift.getShift())
                .workDate(openShift.getWorkDate())
                .plannedStartAt(scheduleTimeWindow.startAt())
                .plannedEndAt(scheduleTimeWindow.endAt())
                .status(AttendanceStatus.SCHEDULED)
                .publishStatus(SchedulePublishStatus.DRAFT)
                .note(request.getNote())
                .build();

        scheduleRepository.save(schedule);
        openShift.setAssignedUser(user);
        openShift.setSchedule(schedule);
        openShift.setStatus(OpenShiftStatus.ASSIGNED);
        openShift.setAssignedAt(LocalDateTime.now());
        openShiftRepository.save(openShift);

        scheduleAuditService.record(schedule, "OPEN_SHIFT_ASSIGNED_TO_SCHEDULE", null, scheduleSnapshot(schedule));
        scheduleAuditService.record(openShift, "OPEN_SHIFT_ASSIGNED", oldValue, openShiftSnapshot(openShift));
        return toOpenShiftResponse(openShift);
    }

    @Transactional(readOnly = true)
    public List<AdminScheduleSwapResponse> getSwapRequests(String status) {
        if (status == null || status.isBlank()) {
            return scheduleSwapRequestRepository.findAllByOrderByCreatedAtDesc()
                    .stream().map(this::toSwapResponse).collect(Collectors.toList());
        }

        ScheduleSwapRequestStatus requestStatus = parseSwapStatus(status);
        return scheduleSwapRequestRepository.findByStatusOrderByCreatedAtDesc(requestStatus)
                .stream().map(this::toSwapResponse).collect(Collectors.toList());
    }

    @Transactional
    public AdminScheduleSwapResponse createSwapRequest(AdminScheduleSwapRequest request) {
        WorkSchedule schedule = scheduleRepository.findById(request.getScheduleId())
                .orElseThrow(() -> new NotFoundException("Schedule not found with id: " + request.getScheduleId()));
        if (resolvePublishStatus(schedule) == SchedulePublishStatus.LOCKED) {
            throw new BadRequestException("Locked schedules cannot be swapped");
        }

        User targetUser = userRepository.findAdminUserById(request.getTargetUserId(), RoleName.STAFF)
                .orElseThrow(() -> new NotFoundException("Target staff not found with id: " + request.getTargetUserId()));
        if (schedule.getUser().getId().equals(targetUser.getId())) {
            throw new BadRequestException("Target staff must be different from the current staff");
        }

        ScheduleSwapRequest swapRequest = ScheduleSwapRequest.builder()
                .schedule(schedule)
                .fromUser(schedule.getUser())
                .targetUser(targetUser)
                .status(ScheduleSwapRequestStatus.PENDING)
                .note(request.getNote())
                .build();

        scheduleSwapRequestRepository.save(swapRequest);
        scheduleAuditService.record(schedule, "SWAP_REQUEST_CREATED", null, swapSnapshot(swapRequest));
        return toSwapResponse(swapRequest);
    }

    @Transactional
    public AdminScheduleSwapResponse approveSwapRequest(String id, AdminScheduleSwapDecisionRequest request) {
        ScheduleSwapRequest swapRequest = scheduleSwapRequestRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Swap request not found with id: " + id));
        if (swapRequest.getStatus() != ScheduleSwapRequestStatus.PENDING) {
            throw new BadRequestException("Only pending swap requests can be approved");
        }

        WorkSchedule schedule = swapRequest.getSchedule();
        scheduleValidationService.validateAssignment(swapRequest.getTargetUser(), schedule.getShift(), schedule.getWorkDate());

        String oldScheduleValue = scheduleSnapshot(schedule);
        schedule.setUser(swapRequest.getTargetUser());
        scheduleRepository.save(schedule);

        swapRequest.setStatus(ScheduleSwapRequestStatus.APPROVED);
        swapRequest.setReviewNote(request.getReviewNote());
        swapRequest.setReviewedAt(LocalDateTime.now());
        scheduleSwapRequestRepository.save(swapRequest);

        scheduleAuditService.record(schedule, "SWAP_REQUEST_APPROVED", oldScheduleValue, scheduleSnapshot(schedule));
        return toSwapResponse(swapRequest);
    }

    @Transactional
    public AdminScheduleSwapResponse rejectSwapRequest(String id, AdminScheduleSwapDecisionRequest request) {
        ScheduleSwapRequest swapRequest = scheduleSwapRequestRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Swap request not found with id: " + id));
        if (swapRequest.getStatus() != ScheduleSwapRequestStatus.PENDING) {
            throw new BadRequestException("Only pending swap requests can be rejected");
        }

        swapRequest.setStatus(ScheduleSwapRequestStatus.REJECTED);
        swapRequest.setReviewNote(request.getReviewNote());
        swapRequest.setReviewedAt(LocalDateTime.now());
        scheduleSwapRequestRepository.save(swapRequest);
        scheduleAuditService.record(swapRequest.getSchedule(), "SWAP_REQUEST_REJECTED", null, swapSnapshot(swapRequest));
        return toSwapResponse(swapRequest);
    }

    private AdminScheduleResponse toResponse(WorkSchedule schedule) {
        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");
        ScheduleTimeWindow fallbackWindow = shiftTimeCalculator.calculateWindow(schedule.getShift(), schedule.getWorkDate());
        return AdminScheduleResponse.builder()
                .id(schedule.getId())
                .userId(schedule.getUser().getId())
                .userFullName(schedule.getUser().getFullName())
                .shiftId(schedule.getShift().getId())
                .shiftName(schedule.getShift().getName())
                .startTime(schedule.getShift().getStartTime().format(timeFormatter))
                .endTime(schedule.getShift().getEndTime().format(timeFormatter))
                .workDate(schedule.getWorkDate())
                .status(schedule.getStatus().name())
                .publishStatus(resolvePublishStatus(schedule))
                .plannedStartAt(schedule.getPlannedStartAt() != null ? schedule.getPlannedStartAt() : fallbackWindow.startAt())
                .plannedEndAt(schedule.getPlannedEndAt() != null ? schedule.getPlannedEndAt() : fallbackWindow.endAt())
                .note(schedule.getNote())
                .attendance(attendanceRecordRepository.findByScheduleId(schedule.getId()).map(this::toAttendanceResponse).orElse(null))
                .build();
    }

    private AdminAttendanceResponse toAttendanceResponse(AttendanceRecord record) {
        return AdminAttendanceResponse.builder()
                .id(record.getId())
                .status(record.getStatus().name())
                .checkInAt(record.getCheckInAt())
                .checkOutAt(record.getCheckOutAt())
                .actualWorkMinutes(record.getActualWorkMinutes())
                .lateMinutes(record.getLateMinutes())
                .earlyLeaveMinutes(record.getEarlyLeaveMinutes())
                .overtimeMinutes(record.getOvertimeMinutes())
                .note(record.getNote())
                .build();
    }

    private AdminOpenShiftResponse toOpenShiftResponse(OpenShift openShift) {
        return AdminOpenShiftResponse.builder()
                .id(openShift.getId())
                .shiftId(openShift.getShift().getId())
                .shiftName(openShift.getShift().getName())
                .workDate(openShift.getWorkDate())
                .plannedStartAt(openShift.getPlannedStartAt())
                .plannedEndAt(openShift.getPlannedEndAt())
                .status(openShift.getStatus().name())
                .assignedUserId(openShift.getAssignedUser() == null ? null : openShift.getAssignedUser().getId())
                .assignedUserFullName(openShift.getAssignedUser() == null ? null : openShift.getAssignedUser().getFullName())
                .scheduleId(openShift.getSchedule() == null ? null : openShift.getSchedule().getId())
                .note(openShift.getNote())
                .build();
    }

    private AdminScheduleSwapResponse toSwapResponse(ScheduleSwapRequest request) {
        return AdminScheduleSwapResponse.builder()
                .id(request.getId())
                .scheduleId(request.getSchedule().getId())
                .shiftId(request.getSchedule().getShift().getId())
                .shiftName(request.getSchedule().getShift().getName())
                .workDate(request.getSchedule().getWorkDate())
                .fromUserId(request.getFromUser().getId())
                .fromUserFullName(request.getFromUser().getFullName())
                .targetUserId(request.getTargetUser().getId())
                .targetUserFullName(request.getTargetUser().getFullName())
                .status(request.getStatus().name())
                .note(request.getNote())
                .reviewNote(request.getReviewNote())
                .reviewedAt(request.getReviewedAt())
                .build();
    }

    private void applyAttendanceMetrics(WorkSchedule schedule, AttendanceRecord attendanceRecord) {
        LocalDateTime checkInAt = attendanceRecord.getCheckInAt();
        LocalDateTime checkOutAt = attendanceRecord.getCheckOutAt();
        LocalDateTime plannedStartAt = schedule.getPlannedStartAt();
        LocalDateTime plannedEndAt = schedule.getPlannedEndAt();

        if (checkInAt != null && checkOutAt != null && checkOutAt.isAfter(checkInAt)) {
            attendanceRecord.setActualWorkMinutes((int) Duration.between(checkInAt, checkOutAt).toMinutes());
        } else {
            attendanceRecord.setActualWorkMinutes(0);
        }

        attendanceRecord.setLateMinutes(checkInAt != null && plannedStartAt != null && checkInAt.isAfter(plannedStartAt)
                ? (int) Duration.between(plannedStartAt, checkInAt).toMinutes()
                : 0);
        attendanceRecord.setEarlyLeaveMinutes(checkOutAt != null && plannedEndAt != null && checkOutAt.isBefore(plannedEndAt)
                ? (int) Duration.between(checkOutAt, plannedEndAt).toMinutes()
                : 0);
        attendanceRecord.setOvertimeMinutes(checkOutAt != null && plannedEndAt != null && checkOutAt.isAfter(plannedEndAt)
                ? (int) Duration.between(plannedEndAt, checkOutAt).toMinutes()
                : 0);
    }

    private void validateDateRange(LocalDate startDate, LocalDate endDate) {
        if (startDate.isAfter(endDate)) {
            throw new BadRequestException("Start date cannot be after end date");
        }
    }

    private SchedulePublishStatus resolvePublishStatus(WorkSchedule schedule) {
        return schedule.getPublishStatus() == null ? SchedulePublishStatus.DRAFT : schedule.getPublishStatus();
    }

    private ScheduleSwapRequestStatus parseSwapStatus(String status) {
        try {
            return ScheduleSwapRequestStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid swap request status: " + status);
        }
    }

    private String scheduleSnapshot(WorkSchedule schedule) {
        return "{\"id\":" + schedule.getId()
                + ",\"userId\":" + (schedule.getUser() == null ? null : schedule.getUser().getId())
                + ",\"shiftId\":" + (schedule.getShift() == null ? null : schedule.getShift().getId())
                + ",\"workDate\":\"" + schedule.getWorkDate()
                + "\",\"status\":\"" + schedule.getStatus()
                + "\",\"publishStatus\":\"" + resolvePublishStatus(schedule) + "\"}";
    }

    private String openShiftSnapshot(OpenShift openShift) {
        return "{\"id\":" + openShift.getId()
                + ",\"shiftId\":" + (openShift.getShift() == null ? null : openShift.getShift().getId())
                + ",\"workDate\":\"" + openShift.getWorkDate()
                + "\",\"status\":\"" + openShift.getStatus()
                + "\",\"assignedUserId\":" + (openShift.getAssignedUser() == null ? null : openShift.getAssignedUser().getId()) + "}";
    }

    private String swapSnapshot(ScheduleSwapRequest request) {
        return "{\"id\":" + request.getId()
                + ",\"scheduleId\":" + request.getSchedule().getId()
                + ",\"fromUserId\":" + request.getFromUser().getId()
                + ",\"targetUserId\":" + request.getTargetUser().getId()
                + ",\"status\":\"" + request.getStatus() + "\"}";
    }
}
