package com.example.graduationproject.admin.staff;

import com.example.graduationproject.admin.staff.dto.AdminStaffRequest;
import com.example.graduationproject.admin.staff.dto.AdminStaffResponse;
import com.example.graduationproject.common.api.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/staffs")
@RequiredArgsConstructor
public class AdminStaffController {

    private final AdminStaffService adminStaffService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<AdminStaffResponse>>> getStaffs(
            @RequestParam(name = "keyword", required = false) String keyword,
            @RequestParam(name = "status", required = false) String status,
            Pageable pageable
    ) {
        return ResponseEntity.ok(ApiResponse.success("Staff members fetched successfully", adminStaffService.getStaffs(keyword, status, pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AdminStaffResponse>> getStaff(@PathVariable("id") String id) {
        return ResponseEntity.ok(ApiResponse.success("Staff detail fetched successfully", adminStaffService.getStaff(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AdminStaffResponse>> createStaff(@Valid @RequestBody AdminStaffRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Staff member created successfully", adminStaffService.createStaff(request)));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<AdminStaffResponse>> updateStatus(@PathVariable("id") String id,
                                                                        @RequestBody Map<String, String> request) {
        return ResponseEntity.ok(ApiResponse.success("Staff status updated successfully", adminStaffService.updateStatus(id, request.get("status"))));
    }
}
