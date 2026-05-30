package com.example.graduationproject.service.coupon;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;

import com.example.graduationproject.entity.Coupon;
import com.example.graduationproject.entity.SavedCoupon;
import com.example.graduationproject.entity.User;
import com.example.graduationproject.entity.enums.CouponStatus;
import com.example.graduationproject.entity.enums.CouponType;
import com.example.graduationproject.exception.BadRequestException;
import com.example.graduationproject.exception.NotFoundException;
import com.example.graduationproject.payment.repository.CouponRepository;
import com.example.graduationproject.payment.repository.SavedCouponRepository;
import com.example.graduationproject.payment.repository.UserRepository;
import com.example.graduationproject.service.coupon.dto.CouponResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CouponService {

    private static final BigDecimal ONE_HUNDRED = BigDecimal.valueOf(100);

    private final CouponRepository couponRepository;
    private final SavedCouponRepository savedCouponRepository;
    private final UserRepository userRepository;

    @Transactional
    public Coupon validateCoupon(String couponCode, User user, BigDecimal subtotal) {
        if (!StringUtils.hasText(couponCode)) {
            return null;
        }

        Coupon coupon = couponRepository.findAvailableByCodeForUpdate(
                        couponCode.trim(),
                        CouponStatus.ACTIVE,
                        LocalDateTime.now()
                )
                .orElseThrow(() -> new BadRequestException("Coupon is invalid or unavailable"));

        if (coupon.getStartAt().isAfter(LocalDateTime.now()) || coupon.getEndAt().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Coupon has expired or is not active yet");
        }

        if (coupon.getMinimumOrderAmount() != null && subtotal.compareTo(coupon.getMinimumOrderAmount()) < 0) {
            throw new BadRequestException("Subtotal does not meet minimum order value for coupon");
        }

        int usedCount = coupon.getUsedCount() != null ? coupon.getUsedCount() : 0;
        if (coupon.getUsageLimit() != null && usedCount >= coupon.getUsageLimit()) {
            throw new BadRequestException("Coupon usage limit has been reached");
        }

        boolean restrictedToUsers = coupon.getUsers() != null && !coupon.getUsers().isEmpty();
        if (restrictedToUsers && (user == null || coupon.getUsers().stream().noneMatch(item -> item.getId().equals(user.getId())))) {
            throw new BadRequestException("Coupon is not assigned to this user");
        }

        return coupon;
    }

    @Transactional(readOnly = true)
    public Coupon validateCouponReadOnly(String couponCode, User user, BigDecimal subtotal) {
        if (!StringUtils.hasText(couponCode)) {
            return null;
        }

        Coupon coupon = couponRepository.findAvailableByCode(
                        couponCode.trim(),
                        CouponStatus.ACTIVE,
                        LocalDateTime.now()
                )
                .orElseThrow(() -> new BadRequestException("Coupon is invalid or unavailable"));

        if (coupon.getStartAt().isAfter(LocalDateTime.now()) || coupon.getEndAt().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Coupon has expired or is not active yet");
        }

        if (coupon.getMinimumOrderAmount() != null && subtotal.compareTo(coupon.getMinimumOrderAmount()) < 0) {
            throw new BadRequestException("Subtotal does not meet minimum order value for coupon");
        }

        int usedCount = coupon.getUsedCount() != null ? coupon.getUsedCount() : 0;
        if (coupon.getUsageLimit() != null && usedCount >= coupon.getUsageLimit()) {
            throw new BadRequestException("Coupon usage limit has been reached");
        }

        boolean restrictedToUsers = coupon.getUsers() != null && !coupon.getUsers().isEmpty();
        if (restrictedToUsers && (user == null || coupon.getUsers().stream().noneMatch(item -> item.getId().equals(user.getId())))) {
            throw new BadRequestException("Coupon is not assigned to this user");
        }

        return coupon;
    }

    public BigDecimal calculateDiscount(Coupon coupon, BigDecimal amount) {
        if (coupon == null) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }

        BigDecimal discount = switch (coupon.getType()) {
            case PERCENTAGE -> amount.multiply(coupon.getDiscountValue())
                    .divide(ONE_HUNDRED, 2, RoundingMode.HALF_UP);
            case FIXED_AMOUNT -> coupon.getDiscountValue();
            case FREE_SHIPPING -> BigDecimal.ZERO;
        };

        if (coupon.getType() == CouponType.PERCENTAGE && coupon.getMaxDiscountValue() != null
                && discount.compareTo(coupon.getMaxDiscountValue()) > 0) {
            discount = coupon.getMaxDiscountValue();
        }

        return discount.min(amount).setScale(2, RoundingMode.HALF_UP);
    }

    @Transactional(readOnly = true)
    public List<CouponResponse> getActivePublicCoupons() {
        return couponRepository.findActivePublicCoupons(LocalDateTime.now())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void saveCouponForUser(String code, String userId) {
        if (!StringUtils.hasText(code)) {
            throw new BadRequestException("Coupon code is required");
        }
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        Coupon coupon = couponRepository.findAvailableByCode(
                        code.trim(),
                        CouponStatus.ACTIVE,
                        LocalDateTime.now()
                )
                .orElseThrow(() -> new NotFoundException("Coupon is invalid or unavailable"));

        if (savedCouponRepository.existsByUserIdAndCouponId(user.getId(), coupon.getId())) {
            throw new BadRequestException("Coupon has already been saved");
        }

        SavedCoupon savedCoupon = SavedCoupon.builder()
                .user(user)
                .coupon(coupon)
                .build();

        savedCouponRepository.save(savedCoupon);
    }

    @Transactional(readOnly = true)
    public List<CouponResponse> getSavedCouponsForUser(String userId) {
        return savedCouponRepository.findByUserId(userId)
                .stream()
                .map(sc -> mapToResponse(sc.getCoupon()))
                .collect(Collectors.toList());
    }

    private CouponResponse mapToResponse(Coupon coupon) {
        return CouponResponse.builder()
                .id(coupon.getId())
                .code(coupon.getCode())
                .description(coupon.getDescription())
                .type(coupon.getType())
                .discountValue(coupon.getDiscountValue())
                .maxDiscountValue(coupon.getMaxDiscountValue())
                .minimumOrderAmount(coupon.getMinimumOrderAmount())
                .startAt(coupon.getStartAt())
                .endAt(coupon.getEndAt())
                .build();
    }
}
