package com.example.graduationproject.admin.promotion;

import com.example.graduationproject.admin.promotion.dto.AdminPromotionListItemResponse;
import com.example.graduationproject.admin.promotion.dto.AdminPromotionStatusRequest;
import com.example.graduationproject.admin.promotion.dto.AdminPromotionUpsertRequest;
import com.example.graduationproject.entity.Product;
import com.example.graduationproject.entity.Promotion;
import com.example.graduationproject.entity.Variant;
import com.example.graduationproject.entity.enums.PromotionStatus;
import com.example.graduationproject.entity.enums.PromotionType;
import com.example.graduationproject.exception.BadRequestException;
import com.example.graduationproject.exception.NotFoundException;
import com.example.graduationproject.payment.repository.ProductRepository;
import com.example.graduationproject.payment.repository.PromotionRepository;
import com.example.graduationproject.payment.repository.VariantRepository;
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
import java.util.Objects;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class AdminPromotionService {

    private final PromotionRepository promotionRepository;
    private final ProductRepository productRepository;
    private final VariantRepository variantRepository;
    private final MongoTemplate mongoTemplate;

    @Transactional(readOnly = true)
    public Page<AdminPromotionListItemResponse> getPromotions(String keyword, String status, Pageable pageable) {
        PromotionStatus promotionStatus = parseStatus(status, true);
        return searchPromotions(normalize(keyword), promotionStatus, pageable)
                .map(this::toResponse);
    }

    private Page<Promotion> searchPromotions(String keyword, PromotionStatus status, Pageable pageable) {
        Query query = new Query();
        List<Criteria> criteriaList = new ArrayList<>();

        if (keyword != null && !keyword.isBlank()) {
            Pattern keywordPattern = Pattern.compile(Pattern.quote(keyword.trim()), Pattern.CASE_INSENSITIVE);
            criteriaList.add(new Criteria().orOperator(
                    Criteria.where("name").regex(keywordPattern),
                    Criteria.where("code").regex(keywordPattern)
            ));
        }
        if (status != null) {
            criteriaList.add(Criteria.where("status").is(status.name()));
        }
        if (!criteriaList.isEmpty()) {
            query.addCriteria(new Criteria().andOperator(criteriaList.toArray(new Criteria[0])));
        }

        long total = mongoTemplate.count(query, Promotion.class);
        query.with(pageable);
        return new PageImpl<>(mongoTemplate.find(query, Promotion.class), pageable, total);
    }

    @Transactional(readOnly = true)
    public AdminPromotionListItemResponse getPromotion(String id) {
        return toResponse(findPromotion(id));
    }

    @Transactional
    public AdminPromotionListItemResponse createPromotion(AdminPromotionUpsertRequest request) {
        validateRequest(request, null);
        Promotion promotion = new Promotion();
        applyRequest(promotion, request);
        return toResponse(promotionRepository.save(promotion));
    }

    @Transactional
    public AdminPromotionListItemResponse updatePromotion(String id, AdminPromotionUpsertRequest request) {
        validateRequest(request, id);
        Promotion promotion = findPromotion(id);
        applyRequest(promotion, request);
        return toResponse(promotionRepository.save(promotion));
    }

    @Transactional
    public AdminPromotionListItemResponse updateStatus(String id, AdminPromotionStatusRequest request) {
        Promotion promotion = findPromotion(id);
        promotion.setStatus(parseStatus(request.getStatus(), false));
        return toResponse(promotionRepository.save(promotion));
    }

    private void validateRequest(AdminPromotionUpsertRequest request, String promotionId) {
        if (request.getStartAt().isAfter(request.getEndAt()) || request.getStartAt().isEqual(request.getEndAt())) {
            throw new BadRequestException("Promotion startAt must be before endAt");
        }
        PromotionType type = parseType(request.getType());
        if (type == PromotionType.PERCENTAGE && request.getDiscountValue().compareTo(java.math.BigDecimal.valueOf(100)) > 0) {
            throw new BadRequestException("Percentage discount must be <= 100");
        }
        if (request.getCode() != null && !request.getCode().isBlank()) {
            if (promotionId == null) {
                if (promotionRepository.existsByCodeIgnoreCase(request.getCode())) {
                    throw new BadRequestException("Promotion code already exists");
                }
            } else if (promotionRepository.existsByCodeIgnoreCaseAndIdNot(request.getCode(), promotionId)) {
                throw new BadRequestException("Promotion code already exists");
            }
        }
    }

    private void applyRequest(Promotion promotion, AdminPromotionUpsertRequest request) {
        List<Product> products = productRepository.findAllById(request.getProductIds());
        if (products.size() != request.getProductIds().size()) {
            throw new NotFoundException("One or more products not found");
        }
        List<Variant> variants = request.getVariantIds() == null || request.getVariantIds().isEmpty()
                ? List.of()
                : variantRepository.findAllById(request.getVariantIds());
        if (request.getVariantIds() != null && variants.size() != request.getVariantIds().size()) {
            throw new NotFoundException("One or more variants not found");
        }

        promotion.setName(request.getName().trim());
        promotion.setCode(request.getCode() != null && !request.getCode().isBlank() ? request.getCode().trim() : null);
        promotion.setDescription(request.getDescription());
        promotion.setType(parseType(request.getType()));
        promotion.setStatus(parseStatus(request.getStatus(), false));
        promotion.setDiscountValue(request.getDiscountValue().setScale(2, RoundingMode.HALF_UP));
        promotion.setMaxDiscountValue(request.getMaxDiscountValue() != null ? request.getMaxDiscountValue().setScale(2, RoundingMode.HALF_UP) : null);
        promotion.setStartAt(request.getStartAt());
        promotion.setEndAt(request.getEndAt());
        promotion.getProducts().clear();
        promotion.getProducts().addAll(products);
        promotion.getVariants().clear();
        promotion.getVariants().addAll(variants);
    }

    private Promotion findPromotion(String id) {
        return promotionRepository.findDetailedById(id)
                .orElseThrow(() -> new NotFoundException("Promotion not found with id: " + id));
    }

    private AdminPromotionListItemResponse toResponse(Promotion promotion) {
        return AdminPromotionListItemResponse.builder()
                .id(promotion.getId())
                .name(promotion.getName())
                .code(promotion.getCode())
                .description(promotion.getDescription())
                .type(promotion.getType() != null ? promotion.getType().name() : null)
                .status(promotion.getStatus() != null ? promotion.getStatus().name() : null)
                .discountValue(promotion.getDiscountValue())
                .maxDiscountValue(promotion.getMaxDiscountValue())
                .startAt(promotion.getStartAt())
                .endAt(promotion.getEndAt())
                .productIds(promotion.getProducts().stream().map(Product::getId).filter(Objects::nonNull).toList())
                .variantIds(promotion.getVariants().stream().map(Variant::getId).filter(Objects::nonNull).toList())
                .build();
    }

    private PromotionStatus parseStatus(String status, boolean allowNull) {
        if (status == null || status.isBlank()) {
            if (allowNull) {
                return null;
            }
            throw new BadRequestException("Promotion status is required");
        }
        try {
            return PromotionStatus.valueOf(status.trim().toUpperCase());
        } catch (Exception ex) {
            throw new BadRequestException("Invalid promotion status: " + status);
        }
    }

    private PromotionType parseType(String type) {
        try {
            return PromotionType.valueOf(type.trim().toUpperCase());
        } catch (Exception ex) {
            throw new BadRequestException("Invalid promotion type: " + type);
        }
    }

    private String normalize(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}
