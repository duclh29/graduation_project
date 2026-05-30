package com.example.graduationproject.shipping;

import com.example.graduationproject.common.api.ApiResponse;
import com.example.graduationproject.shipping.dto.ShippingResponse;
import com.example.graduationproject.shipping.dto.UpdateShippingStatusRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/shipping")
@RequiredArgsConstructor
public class ShippingController {

    private final ShippingService shippingService;

    @PostMapping("/{orderId}")
    public ResponseEntity<ApiResponse<ShippingResponse>> createShipment(@PathVariable String orderId) {
        return ResponseEntity.ok(ApiResponse.success("Shipment created successfully", shippingService.createShipment(orderId)));
    }

    @PatchMapping("/{shippingId}/status")
    public ResponseEntity<ApiResponse<ShippingResponse>> updateStatus(@PathVariable String shippingId,
                                                                      @Valid @RequestBody UpdateShippingStatusRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Shipping status updated successfully", shippingService.updateStatus(shippingId, request)));
    }

    @GetMapping("/tracking")
    public ResponseEntity<ApiResponse<ShippingResponse>> track(@RequestParam String trackingNumber) {
        return ResponseEntity.ok(ApiResponse.success("Shipping tracking fetched successfully", shippingService.track(trackingNumber)));
    }
}
