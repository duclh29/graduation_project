package com.example.graduationproject.seeder;

import com.example.graduationproject.entity.Coupon;
import com.example.graduationproject.entity.enums.CouponStatus;
import com.example.graduationproject.entity.enums.CouponType;
import com.example.graduationproject.payment.repository.CouponRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class CouponDemoSeeder implements CommandLineRunner {

    private final CouponRepository couponRepository;

    @Override
    public void run(String... args) {
        if (couponRepository.count() > 0) {
            return; // Don't run if already seeded
        }

        try {
            Coupon coupon1 = Coupon.builder()
                    .code("NEWYEAR20")
                    .description("Giảm giá năm mới 20%")
                    .type(CouponType.PERCENTAGE)
                    .status(CouponStatus.ACTIVE)
                    .discountValue(BigDecimal.valueOf(20))
                    .maxDiscountValue(BigDecimal.valueOf(100000))
                    .minimumOrderAmount(BigDecimal.valueOf(200000))
                    .startAt(LocalDateTime.now().minusDays(1))
                    .endAt(LocalDateTime.now().plusMonths(1))
                    .usageLimit(100)
                    .usedCount(0)
                    .build();

            Coupon coupon2 = Coupon.builder()
                    .code("FREESHIP30K")
                    .description("Miễn phí vận chuyển (Giảm 30K)")
                    .type(CouponType.FIXED_AMOUNT)
                    .status(CouponStatus.ACTIVE)
                    .discountValue(BigDecimal.valueOf(30000))
                    .maxDiscountValue(BigDecimal.valueOf(30000))
                    .minimumOrderAmount(BigDecimal.valueOf(0))
                    .startAt(LocalDateTime.now().minusDays(1))
                    .endAt(LocalDateTime.now().plusMonths(1))
                    .usageLimit(500)
                    .usedCount(0)
                    .build();

            couponRepository.saveAll(List.of(coupon1, coupon2));
            log.info("Successfully seeded 2 demo coupons: NEWYEAR20, FREESHIP30K");
        } catch (Exception e) {
            log.error("Failed to seed demo coupons, they might already exist.", e);
        }
    }
}
