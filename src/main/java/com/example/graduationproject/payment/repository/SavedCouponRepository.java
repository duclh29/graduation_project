package com.example.graduationproject.payment.repository;

import java.util.List;

import com.example.graduationproject.entity.SavedCoupon;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface SavedCouponRepository extends MongoRepository<SavedCoupon, String> {
    
    List<SavedCoupon> findByUserId(String userId);
    
    boolean existsByUserIdAndCouponId(String userId, String couponId);
}
