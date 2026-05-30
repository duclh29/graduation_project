package com.example.graduationproject.shipping;

import com.example.graduationproject.entity.OrderStatusHistory;
import com.example.graduationproject.entity.Shipping;
import com.example.graduationproject.entity.enums.OrderStatus;
import com.example.graduationproject.entity.enums.ShippingStatus;
import com.example.graduationproject.exception.NotFoundException;
import com.example.graduationproject.payment.repository.OrderStatusHistoryRepository;
import com.example.graduationproject.payment.repository.ShippingRepository;
import com.example.graduationproject.shipping.dto.ShippingResponse;
import com.example.graduationproject.shipping.dto.UpdateShippingStatusRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ShippingService {

    private final ShippingRepository shippingRepository;
    private final OrderStatusHistoryRepository orderStatusHistoryRepository;

    @Transactional
    public ShippingResponse createShipment(String orderId) {
        Shipping shipping = shippingRepository.findByOrderId(orderId)
                .orElseThrow(() -> new NotFoundException("Shipping not found for order"));
        if (shipping.getTrackingNumber() == null || shipping.getTrackingNumber().isBlank()) {
            shipping.setTrackingNumber("TRK-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        }
        return map(shippingRepository.save(shipping));
    }

    @Transactional
    public ShippingResponse updateStatus(String shippingId, UpdateShippingStatusRequest request) {
        Shipping shipping = shippingRepository.findById(shippingId)
                .orElseThrow(() -> new NotFoundException("Shipping not found"));
        shipping.setStatus(request.getStatus());
        if (request.getStatus() == ShippingStatus.SHIPPED) {
            shipping.setShippedAt(LocalDateTime.now());
        }
        if (request.getStatus() == ShippingStatus.DELIVERED) {
            shipping.setDeliveredAt(LocalDateTime.now());
            orderStatusHistoryRepository.save(OrderStatusHistory.builder()
                    .order(shipping.getOrder())
                    .status(OrderStatus.DELIVERED)
                    .note("Order delivered via shipping update")
                    .changedAt(LocalDateTime.now())
                    .build());
        }
        return map(shippingRepository.save(shipping));
    }

    @Transactional(readOnly = true)
    public ShippingResponse track(String trackingNumber) {
        return shippingRepository.findByTrackingNumber(trackingNumber)
                .map(this::map)
                .orElseThrow(() -> new NotFoundException("Shipment not found"));
    }

    private ShippingResponse map(Shipping shipping) {
        return ShippingResponse.builder()
                .shippingId(shipping.getId())
                .orderId(shipping.getOrder().getId())
                .status(shipping.getStatus())
                .trackingNumber(shipping.getTrackingNumber())
                .build();
    }
}

