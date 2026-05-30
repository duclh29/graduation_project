package com.example.graduationproject.payment.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import com.example.graduationproject.entity.Promotion;
import com.example.graduationproject.entity.enums.PromotionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

public interface PromotionRepository extends MongoRepository<Promotion, String>, PromotionRepositoryCustom {

    @Query("{ 'status': ?2, 'startAt': { $lte: ?3 }, 'endAt': { $gte: ?3 }, $or: [ { 'products': ?0 }, { 'variants': ?1 } ] }")
    List<Promotion> findActivePromotions(String productId,
                                         String variantId,
                                         PromotionStatus status,
                                         LocalDateTime now);

    Optional<Promotion> findDetailedById(String id);

    boolean existsByCodeIgnoreCase(String code);

    boolean existsByCodeIgnoreCaseAndIdNot(String code, String id);
}
