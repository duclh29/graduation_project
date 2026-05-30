package com.example.graduationproject.admin.promotion;

import com.example.graduationproject.admin.promotion.dto.AdminPromotionListItemResponse;
import com.example.graduationproject.admin.promotion.dto.AdminPromotionStatusRequest;
import com.example.graduationproject.admin.promotion.dto.AdminPromotionUpsertRequest;
import com.example.graduationproject.common.api.ApiResponse;
import com.example.graduationproject.common.api.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
@RequestMapping("/api/admin/promotions")
@RequiredArgsConstructor
public class AdminPromotionController {

    private final AdminPromotionService adminPromotionService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<AdminPromotionListItemResponse>>> getPromotions(
            @RequestParam(name = "keyword", required = false) String keyword,
            @RequestParam(name = "status", required = false) String status,
            Pageable pageable
    ) {
        return ResponseEntity.ok(ApiResponse.success("Admin promotions fetched successfully", PageResponse.from(adminPromotionService.getPromotions(keyword, status, pageable))));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AdminPromotionListItemResponse>> getPromotion(@PathVariable("id") String id) {
        return ResponseEntity.ok(ApiResponse.success("Admin promotion detail fetched successfully", adminPromotionService.getPromotion(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AdminPromotionListItemResponse>> createPromotion(@Valid @RequestBody AdminPromotionUpsertRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Admin promotion created successfully", adminPromotionService.createPromotion(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AdminPromotionListItemResponse>> updatePromotion(@PathVariable("id") String id,
                                                                                        @Valid @RequestBody AdminPromotionUpsertRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Admin promotion updated successfully", adminPromotionService.updatePromotion(id, request)));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<AdminPromotionListItemResponse>> updateStatus(@PathVariable("id") String id,
                                                                                     @Valid @RequestBody AdminPromotionStatusRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Admin promotion status updated successfully", adminPromotionService.updateStatus(id, request)));
    }
}
