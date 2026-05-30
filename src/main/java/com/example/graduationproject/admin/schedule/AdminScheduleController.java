package com.example.graduationproject.admin.schedule;

import com.example.graduationproject.admin.schedule.dto.AdminAttendanceRequest;
import com.example.graduationproject.admin.schedule.dto.AdminOpenShiftAssignRequest;
import com.example.graduationproject.admin.schedule.dto.AdminOpenShiftRequest;
import com.example.graduationproject.admin.schedule.dto.AdminOpenShiftResponse;
import com.example.graduationproject.admin.schedule.dto.AdminScheduleAutoFillWeekRequest;
import com.example.graduationproject.admin.schedule.dto.AdminScheduleRequest;
import com.example.graduationproject.admin.schedule.dto.AdminScheduleResponse;
import com.example.graduationproject.admin.schedule.dto.AdminScheduleBulkRequest;
import com.example.graduationproject.admin.schedule.dto.AdminScheduleCopyWeekRequest;
import com.example.graduationproject.admin.schedule.dto.AdminScheduleRangeRequest;
import com.example.graduationproject.admin.schedule.dto.AdminScheduleSwapDecisionRequest;
import com.example.graduationproject.admin.schedule.dto.AdminScheduleSwapRequest;
import com.example.graduationproject.admin.schedule.dto.AdminScheduleSwapResponse;
import com.example.graduationproject.common.api.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/admin/schedules")
@RequiredArgsConstructor
public class AdminScheduleController {

    private final AdminScheduleService adminScheduleService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<AdminScheduleResponse>>> getSchedules(
            @RequestParam("startDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam("endDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        return ResponseEntity.ok(ApiResponse.success("Schedules fetched successfully", adminScheduleService.getSchedulesBetween(startDate, endDate)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AdminScheduleResponse>> assignSchedule(@Valid @RequestBody AdminScheduleRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Schedule assigned successfully", adminScheduleService.assignSchedule(request)));
    }

    @PostMapping("/bulk")
    public ResponseEntity<ApiResponse<List<AdminScheduleResponse>>> assignSchedulesBulk(@Valid @RequestBody AdminScheduleBulkRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Schedules assigned successfully", adminScheduleService.assignSchedulesBulk(request)));
    }

    @PostMapping("/copy-week")
    public ResponseEntity<ApiResponse<List<AdminScheduleResponse>>> copyWeek(@Valid @RequestBody AdminScheduleCopyWeekRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Schedules copied successfully", adminScheduleService.copyWeek(request)));
    }

    @PostMapping("/auto-fill-week")
    public ResponseEntity<ApiResponse<List<AdminScheduleResponse>>> autoFillWeek(@Valid @RequestBody AdminScheduleAutoFillWeekRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Weekly schedules auto-filled successfully", adminScheduleService.autoFillWeek(request)));
    }

    @PostMapping("/publish")
    public ResponseEntity<ApiResponse<List<AdminScheduleResponse>>> publishSchedules(@Valid @RequestBody AdminScheduleRangeRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Schedules published successfully", adminScheduleService.publishSchedules(request)));
    }

    @PostMapping("/lock")
    public ResponseEntity<ApiResponse<List<AdminScheduleResponse>>> lockSchedules(@Valid @RequestBody AdminScheduleRangeRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Schedules locked successfully", adminScheduleService.lockSchedules(request)));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<AdminScheduleResponse>> updateAttendance(
            @PathVariable("id") String id,
            @Valid @RequestBody AdminAttendanceRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Attendance updated successfully", adminScheduleService.updateAttendance(id, request)));
    }

    @GetMapping("/open-shifts")
    public ResponseEntity<ApiResponse<List<AdminOpenShiftResponse>>> getOpenShifts(
            @RequestParam("startDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam("endDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        return ResponseEntity.ok(ApiResponse.success("Open shifts fetched successfully", adminScheduleService.getOpenShifts(startDate, endDate)));
    }

    @PostMapping("/open-shifts")
    public ResponseEntity<ApiResponse<AdminOpenShiftResponse>> createOpenShift(@Valid @RequestBody AdminOpenShiftRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Open shift created successfully", adminScheduleService.createOpenShift(request)));
    }

    @PostMapping("/open-shifts/{id}/assign")
    public ResponseEntity<ApiResponse<AdminOpenShiftResponse>> assignOpenShift(
            @PathVariable("id") String id,
            @Valid @RequestBody AdminOpenShiftAssignRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Open shift assigned successfully", adminScheduleService.assignOpenShift(id, request)));
    }

    @GetMapping("/swap-requests")
    public ResponseEntity<ApiResponse<List<AdminScheduleSwapResponse>>> getSwapRequests(@RequestParam(name = "status", required = false) String status) {
        return ResponseEntity.ok(ApiResponse.success("Swap requests fetched successfully", adminScheduleService.getSwapRequests(status)));
    }

    @PostMapping("/swap-requests")
    public ResponseEntity<ApiResponse<AdminScheduleSwapResponse>> createSwapRequest(@Valid @RequestBody AdminScheduleSwapRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Swap request created successfully", adminScheduleService.createSwapRequest(request)));
    }

    @PostMapping("/swap-requests/{id}/approve")
    public ResponseEntity<ApiResponse<AdminScheduleSwapResponse>> approveSwapRequest(
            @PathVariable("id") String id,
            @RequestBody AdminScheduleSwapDecisionRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Swap request approved successfully", adminScheduleService.approveSwapRequest(id, request)));
    }

    @PostMapping("/swap-requests/{id}/reject")
    public ResponseEntity<ApiResponse<AdminScheduleSwapResponse>> rejectSwapRequest(
            @PathVariable("id") String id,
            @RequestBody AdminScheduleSwapDecisionRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Swap request rejected successfully", adminScheduleService.rejectSwapRequest(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSchedule(@PathVariable("id") String id) {
        adminScheduleService.deleteSchedule(id);
        return ResponseEntity.ok(ApiResponse.success("Schedule deleted successfully", null));
    }
}
