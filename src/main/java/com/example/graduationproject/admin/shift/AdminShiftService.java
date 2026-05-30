package com.example.graduationproject.admin.shift;

import com.example.graduationproject.admin.shift.dto.AdminShiftRequest;
import com.example.graduationproject.admin.shift.dto.AdminShiftResponse;
import com.example.graduationproject.entity.Shift;
import com.example.graduationproject.entity.enums.ShiftStatus;
import com.example.graduationproject.exception.BadRequestException;
import com.example.graduationproject.exception.NotFoundException;
import com.example.graduationproject.payment.repository.ShiftRepository;
import com.example.graduationproject.payment.repository.WorkScheduleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminShiftService {

    private final ShiftRepository shiftRepository;
    private final WorkScheduleRepository workScheduleRepository;

    @Transactional(readOnly = true)
    public List<AdminShiftResponse> getAllShifts() {
        return shiftRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AdminShiftResponse getShift(String id) {
        Shift shift = shiftRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Shift not found with id: " + id));
        return toResponse(shift);
    }

    @Transactional
    public AdminShiftResponse createShift(AdminShiftRequest request) {
        validateShiftRequest(request, null);

        Shift shift = Shift.builder()
                .code(request.getCode().trim().toUpperCase())
                .name(request.getName().trim())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .crossDay(resolveCrossDay(request))
                .breakMinutes(request.getBreakMinutes())
                .paidBreakMinutes(request.getPaidBreakMinutes())
                .minStaff(request.getMinStaff())
                .maxStaff(request.getMaxStaff())
                .status(request.getStatus())
                .description(request.getDescription())
                .build();
        shiftRepository.save(shift);
        return toResponse(shift);
    }

    @Transactional
    public AdminShiftResponse updateShift(String id, AdminShiftRequest request) {
        Shift shift = shiftRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Shift not found with id: " + id));

        validateShiftRequest(request, id);

        shift.setCode(request.getCode().trim().toUpperCase());
        shift.setName(request.getName().trim());
        shift.setStartTime(request.getStartTime());
        shift.setEndTime(request.getEndTime());
        shift.setCrossDay(resolveCrossDay(request));
        shift.setBreakMinutes(request.getBreakMinutes());
        shift.setPaidBreakMinutes(request.getPaidBreakMinutes());
        shift.setMinStaff(request.getMinStaff());
        shift.setMaxStaff(request.getMaxStaff());
        shift.setStatus(request.getStatus());
        shift.setDescription(request.getDescription());

        shiftRepository.save(shift);
        return toResponse(shift);
    }

    @Transactional
    public void deleteShift(String id) {
        if (!shiftRepository.existsById(id)) {
            throw new NotFoundException("Shift not found with id: " + id);
        }
        if (workScheduleRepository.existsByShiftId(id)) {
            throw new BadRequestException("This shift is already used in work schedules and cannot be deleted");
        }
        shiftRepository.deleteById(id);
    }

    private AdminShiftResponse toResponse(Shift shift) {
        return AdminShiftResponse.builder()
                .id(shift.getId())
                .code(shift.getCode())
                .name(shift.getName())
                .startTime(shift.getStartTime())
                .endTime(shift.getEndTime())
                .crossDay(Boolean.TRUE.equals(shift.getCrossDay()))
                .breakMinutes(shift.getBreakMinutes() == null ? 0 : shift.getBreakMinutes())
                .paidBreakMinutes(shift.getPaidBreakMinutes() == null ? 0 : shift.getPaidBreakMinutes())
                .minStaff(shift.getMinStaff() == null ? 1 : shift.getMinStaff())
                .maxStaff(shift.getMaxStaff() == null ? 1 : shift.getMaxStaff())
                .status(shift.getStatus() == null ? ShiftStatus.ACTIVE : shift.getStatus())
                .description(shift.getDescription())
                .build();
    }

    private void validateShiftRequest(AdminShiftRequest request, String shiftId) {
        String normalizedCode = request.getCode().trim().toUpperCase();
        boolean duplicateCode = shiftId == null
                ? shiftRepository.existsByCodeIgnoreCase(normalizedCode)
                : shiftRepository.existsByCodeIgnoreCaseAndIdNot(normalizedCode, shiftId);

        if (duplicateCode) {
            throw new BadRequestException("Shift code already exists: " + normalizedCode);
        }

        if (request.getPaidBreakMinutes() > request.getBreakMinutes()) {
            throw new BadRequestException("Paid break minutes cannot be greater than total break minutes");
        }

        if (request.getMaxStaff() < request.getMinStaff()) {
            throw new BadRequestException("Maximum staff must be greater than or equal to minimum staff");
        }

        boolean crossDay = resolveCrossDay(request);
        LocalDate referenceDate = LocalDate.of(2000, 1, 1);
        LocalDateTime startAt = LocalDateTime.of(referenceDate, request.getStartTime());
        LocalDateTime endAt = LocalDateTime.of(crossDay ? referenceDate.plusDays(1) : referenceDate, request.getEndTime());
        Duration duration = Duration.between(startAt, endAt);
        long durationMinutes = duration.toMinutes();
        if (durationMinutes <= 0) {
            throw new BadRequestException("Shift duration must be greater than zero");
        }

        if (durationMinutes >= 360 && request.getBreakMinutes() <= 0) {
            throw new BadRequestException("Shifts of 6 hours or more must define a break");
        }
    }

    private boolean resolveCrossDay(AdminShiftRequest request) {
        return Boolean.TRUE.equals(request.getCrossDay()) || request.getEndTime().isBefore(request.getStartTime());
    }
}
