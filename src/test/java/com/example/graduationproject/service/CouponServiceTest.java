package com.example.graduationproject.service;

import com.example.graduationproject.entity.Coupon;
import com.example.graduationproject.entity.enums.CouponStatus;
import com.example.graduationproject.entity.enums.CouponType;
import com.example.graduationproject.entity.User;
import com.example.graduationproject.payment.repository.CouponRepository;
import com.example.graduationproject.service.coupon.CouponService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CouponServiceTest {

    @Mock
    private CouponRepository couponRepository;

    @InjectMocks
    private CouponService couponService;

    @Test
    void shouldCalculatePercentageDiscount() {
        Coupon coupon = Coupon.builder()
                .code("SALE10")
                .type(CouponType.PERCENTAGE)
                .status(CouponStatus.ACTIVE)
                .discountValue(BigDecimal.TEN)
                .startAt(LocalDateTime.now().minusDays(1))
                .endAt(LocalDateTime.now().plusDays(1))
                .usageLimit(10)
                .usedCount(0)
                .build();
        when(couponRepository.findAvailableByCodeForUpdate(eq("SALE10"), eq(CouponStatus.ACTIVE), any()))
                .thenReturn(Optional.of(coupon));

        Coupon validated = couponService.validateCoupon("SALE10", User.builder().id("1").build(), BigDecimal.valueOf(1000));
        BigDecimal discount = couponService.calculateDiscount(validated, BigDecimal.valueOf(1000));

        assertThat(discount).isEqualByComparingTo("100.00");
    }
}
