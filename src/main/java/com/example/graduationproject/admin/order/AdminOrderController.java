package com.example.graduationproject.admin.order;

import com.example.graduationproject.admin.order.dto.AdminOrderHistoryItemResponse;
import com.example.graduationproject.admin.order.dto.AdminOrderListItemResponse;
import com.example.graduationproject.admin.order.dto.AdminProcessReturnRequest;
import com.example.graduationproject.admin.order.dto.AdminUpdateOrderStatusRequest;
import com.example.graduationproject.common.api.ApiResponse;
import com.example.graduationproject.common.api.PageResponse;
import com.example.graduationproject.service.dto.OrderDetailResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/orders")
@RequiredArgsConstructor
public class AdminOrderController {

    private final AdminOrderService adminOrderService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<AdminOrderListItemResponse>>> getOrders(
            @RequestParam(name = "keyword", required = false) String keyword,
            @RequestParam(name = "status", required = false) String status,
            Pageable pageable
    ) {
        return ResponseEntity.ok(ApiResponse.success("Admin orders fetched successfully", PageResponse.from(adminOrderService.getOrders(keyword, status, pageable))));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderDetailResponse>> getOrderDetail(@PathVariable("id") String id) {
        return ResponseEntity.ok(ApiResponse.success("Admin order detail fetched successfully", adminOrderService.getOrderDetail(id)));
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<ApiResponse<List<AdminOrderHistoryItemResponse>>> getOrderHistory(@PathVariable("id") String id) {
        return ResponseEntity.ok(ApiResponse.success("Admin order history fetched successfully", adminOrderService.getOrderHistory(id)));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<OrderDetailResponse>> updateOrderStatus(
            @PathVariable("id") String id,
            @Valid @RequestBody AdminUpdateOrderStatusRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success("Admin order status updated successfully", adminOrderService.updateStatus(id, request)));
    }

    @PutMapping("/{id}/return-request/approve")
    public ResponseEntity<ApiResponse<OrderDetailResponse>> approveReturnRequest(
            @PathVariable("id") String id,
            @RequestBody(required = false) AdminProcessReturnRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success("Return request approved successfully", adminOrderService.approveReturnRequest(id, request != null ? request.getNote() : null)));
    }

    @PutMapping("/{id}/return-request/reject")
    public ResponseEntity<ApiResponse<OrderDetailResponse>> rejectReturnRequest(
            @PathVariable("id") String id,
            @RequestBody(required = false) AdminProcessReturnRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success("Return request rejected successfully", adminOrderService.rejectReturnRequest(id, request != null ? request.getNote() : null)));
    }
}
