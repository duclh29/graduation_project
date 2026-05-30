package com.example.graduationproject.payment.repository;

import java.util.Optional;

import com.example.graduationproject.entity.Shipping;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ShippingRepository extends MongoRepository<Shipping, String> {

    Optional<Shipping> findByOrderId(String orderId);

    Optional<Shipping> findByTrackingNumber(String trackingNumber);
}
