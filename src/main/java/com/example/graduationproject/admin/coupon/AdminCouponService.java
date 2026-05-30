package com.example.graduationproject.admin.coupon;

import com.example.graduationproject.admin.coupon.dto.AdminCouponListItemResponse;
import com.example.graduationproject.admin.coupon.dto.AdminCouponStatusRequest;
import com.example.graduationproject.admin.coupon.dto.AdminCouponUpsertRequest;
import com.example.graduationproject.entity.Coupon;
import com.example.graduationproject.entity.enums.CouponStatus;
import com.example.graduationproject.entity.enums.CouponType;
import com.example.graduationproject.exception.BadRequestException;
import com.example.graduationproject.exception.NotFoundException;
import com.example.graduationproject.payment.repository.CouponRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class AdminCouponService {

    private final CouponRepository couponRepository;
    private final MongoTemplate mongoTemplate;

    @Transactional(readOnly = true)
    public Page<AdminCouponListItemResponse> getCoupons(String keyword, String status, Pageable pageable) {
        CouponStatus couponStatus = parseStatus(status, true);
        return searchCoupons(normalize(keyword), couponStatus, pageable)
                .map(this::toResponse);
    }

    private Page<Coupon> searchCoupons(String keyword, CouponStatus status, Pageable pageable) {
        Query query = new Query();
        List<Criteria> criteriaList = new ArrayList<>();

        if (keyword != null && !keyword.isBlank()) {
            Pattern keywordPattern = Pattern.compile(Pattern.quote(keyword.trim()), Pattern.CASE_INSENSITIVE);
            criteriaList.add(new Criteria().orOperator(
                    Criteria.where("code").regex(keywordPattern),
                    Criteria.where("description").regex(keywordPattern)
            ));
        }
        if (status != null) {
            criteriaList.add(Criteria.where("status").is(status.name()));
        }
        if (!criteriaList.isEmpty()) {
            query.addCriteria(new Criteria().andOperator(criteriaList.toArray(new Criteria[0])));
        }

        long total = mongoTemplate.count(query, Coupon.class);
        query.with(pageable);
        return new PageImpl<>(mongoTemplate.find(query, Coupon.class), pageable, total);
    }

    @Transactional(readOnly = true)
    public AdminCouponListItemResponse getCoupon(String id) {
        return toResponse(findCoupon(id));
    }

    @Transactional
    public AdminCouponListItemResponse createCoupon(AdminCouponUpsertRequest request) {
        validateRequest(request, null);
        Coupon coupon = new Coupon();
        applyRequest(coupon, request);
        return toResponse(couponRepository.save(coupon));
    }

    @Transactional
    public AdminCouponListItemResponse updateCoupon(String id, AdminCouponUpsertRequest request) {
        validateRequest(request, id);
        Coupon coupon = findCoupon(id);
        applyRequest(coupon, request);
        return toResponse(couponRepository.save(coupon));
    }

    @Transactional
    public AdminCouponListItemResponse updateStatus(String id, AdminCouponStatusRequest request) {
        Coupon coupon = findCoupon(id);
        coupon.setStatus(parseStatus(request.getStatus(), false));
        return toResponse(couponRepository.save(coupon));
    }

    private void validateRequest(AdminCouponUpsertRequest request, String couponId) {
        if (request.getStartAt().isAfter(request.getEndAt()) || request.getStartAt().isEqual(request.getEndAt())) {
            throw new BadRequestException("Coupon startAt must be before endAt");
        }
        CouponType type = parseType(request.getType());
        if (type == CouponType.PERCENTAGE && request.getDiscountValue().compareTo(java.math.BigDecimal.valueOf(100)) > 0) {
            throw new BadRequestException("Percentage discount must be <= 100");
        }
        if (request.getCode() != null && !request.getCode().isBlank()) {
            if (couponId == null) {
                if (couponRepository.existsByCodeIgnoreCase(request.getCode().trim())) {
                    throw new BadRequestException("Coupon code already exists");
                }
            } else if (couponRepository.existsByCodeIgnoreCaseAndIdNot(request.getCode().trim(), couponId)) {
                throw new BadRequestException("Coupon code already exists");
            }
        }
    }

    private void applyRequest(Coupon coupon, AdminCouponUpsertRequest request) {
        coupon.setCode(request.getCode().trim());
        coupon.setDescription(request.getDescription());
        coupon.setType(parseType(request.getType()));
        coupon.setStatus(parseStatus(request.getStatus(), false));
        coupon.setDiscountValue(request.getDiscountValue().setScale(2, RoundingMode.HALF_UP));
        coupon.setMaxDiscountValue(request.getMaxDiscountValue() != null ? request.getMaxDiscountValue().setScale(2, RoundingMode.HALF_UP) : null);
        coupon.setMinimumOrderAmount(request.getMinimumOrderAmount() != null ? request.getMinimumOrderAmount().setScale(2, RoundingMode.HALF_UP) : null);
        coupon.setUsageLimit(request.getUsageLimit());
        coupon.setStartAt(request.getStartAt());
        coupon.setEndAt(request.getEndAt());
        if (coupon.getUsedCount() == null) {
            coupon.setUsedCount(0);
        }
    }

    private Coupon findCoupon(String id) {
        return couponRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Coupon not found with id: " + id));
    }

    private AdminCouponListItemResponse toResponse(Coupon coupon) {
        return AdminCouponListItemResponse.builder()
                .id(coupon.getId())
                .code(coupon.getCode())
                .description(coupon.getDescription())
                .type(coupon.getType() != null ? coupon.getType().name() : null)
                .status(coupon.getStatus() != null ? coupon.getStatus().name() : null)
                .discountValue(coupon.getDiscountValue())
                .maxDiscountValue(coupon.getMaxDiscountValue())
                .minimumOrderAmount(coupon.getMinimumOrderAmount())
                .usageLimit(coupon.getUsageLimit())
                .usedCount(coupon.getUsedCount())
                .startAt(coupon.getStartAt())
                .endAt(coupon.getEndAt())
                .build();
    }

    private CouponStatus parseStatus(String status, boolean allowNull) {
        if (status == null || status.isBlank()) {
            if (allowNull) {
                return null;
            }
            throw new BadRequestException("Coupon status is required");
        }
        try {
            return CouponStatus.valueOf(status.trim().toUpperCase());
        } catch (Exception ex) {
            throw new BadRequestException("Invalid coupon status: " + status);
        }
    }

    private CouponType parseType(String type) {
        try {
            return CouponType.valueOf(type.trim().toUpperCase());
        } catch (Exception ex) {
            throw new BadRequestException("Invalid coupon type: " + type);
        }
    }

    private String normalize(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}
