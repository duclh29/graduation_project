package com.example.graduationproject.admin.user;

import com.example.graduationproject.admin.user.dto.AdminUserDetailResponse;
import com.example.graduationproject.admin.user.dto.AdminUserListItemResponse;
import com.example.graduationproject.common.api.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final AdminUserService adminUserService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<AdminUserListItemResponse>>> getUsers(
            @RequestParam(name = "keyword", required = false) String keyword,
            @RequestParam(name = "status", required = false) String status,
            Pageable pageable
    ) {
        return ResponseEntity.ok(ApiResponse.success("Admin users fetched successfully", adminUserService.getUsers(keyword, status, pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AdminUserDetailResponse>> getUser(@PathVariable("id") String id) {
        return ResponseEntity.ok(ApiResponse.success("Admin user detail fetched successfully", adminUserService.getUser(id)));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<AdminUserDetailResponse>> updateStatus(@PathVariable("id") String id,
                                                                             @RequestBody Map<String, String> request) {
        return ResponseEntity.ok(ApiResponse.success("Admin user status updated successfully", adminUserService.updateStatus(id, request.get("status"))));
    }
}
