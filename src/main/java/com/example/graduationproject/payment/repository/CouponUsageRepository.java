package com.example.graduationproject.payment.repository;

import com.example.graduationproject.entity.CouponUsage;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface CouponUsageRepository extends MongoRepository<CouponUsage, String> {
    Optional<CouponUsage> findByOrderId(String orderId);
}
