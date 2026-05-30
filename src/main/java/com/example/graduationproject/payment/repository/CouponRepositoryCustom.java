package com.example.graduationproject.payment.repository;

import com.example.graduationproject.entity.Coupon;
import com.example.graduationproject.entity.enums.CouponStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CouponRepositoryCustom {
    Page<Coupon> searchAdminCoupons(String keyword, CouponStatus status, Pageable pageable);
}
