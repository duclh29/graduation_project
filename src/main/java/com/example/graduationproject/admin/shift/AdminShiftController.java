package com.example.graduationproject.admin.shift;

import com.example.graduationproject.admin.shift.dto.AdminShiftRequest;
import com.example.graduationproject.admin.shift.dto.AdminShiftResponse;
import com.example.graduationproject.common.api.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/shifts")
@RequiredArgsConstructor
public class AdminShiftController {

    private final AdminShiftService adminShiftService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<AdminShiftResponse>>> getAllShifts() {
        return ResponseEntity.ok(ApiResponse.success("Shifts fetched successfully", adminShiftService.getAllShifts()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AdminShiftResponse>> getShift(@PathVariable("id") String id) {
        return ResponseEntity.ok(ApiResponse.success("Shift fetched successfully", adminShiftService.getShift(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AdminShiftResponse>> createShift(@Valid @RequestBody AdminShiftRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Shift created successfully", adminShiftService.createShift(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AdminShiftResponse>> updateShift(@PathVariable("id") String id, @Valid @RequestBody AdminShiftRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Shift updated successfully", adminShiftService.updateShift(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteShift(@PathVariable("id") String id) {
        adminShiftService.deleteShift(id);
        return ResponseEntity.ok(ApiResponse.success("Shift deleted successfully", null));
    }
}
