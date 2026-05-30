package com.example.graduationproject.payment.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import com.example.graduationproject.entity.Coupon;
import com.example.graduationproject.entity.enums.CouponStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

public interface CouponRepository extends MongoRepository<Coupon, String>, CouponRepositoryCustom {

    @Query("{ 'code': { $regex: '^?0$', $options: 'i' }, 'status': ?1, 'startAt': { $lte: ?2 }, 'endAt': { $gte: ?2 } }")
    Optional<Coupon> findAvailableByCodeForUpdate(String code, CouponStatus status, LocalDateTime now);

    @Query("{ 'code': { $regex: '^?0$', $options: 'i' }, 'status': ?1, 'startAt': { $lte: ?2 }, 'endAt': { $gte: ?2 } }")
    Optional<Coupon> findAvailableByCode(String code, CouponStatus status, LocalDateTime now);

    @Query("{ 'status': 'ACTIVE', 'startAt': { $lte: ?0 }, 'endAt': { $gte: ?0 } }")
    List<Coupon> findActivePublicCoupons(LocalDateTime now);

    boolean existsByCodeIgnoreCase(String code);

    boolean existsByCodeIgnoreCaseAndIdNot(String code, String id);
}
