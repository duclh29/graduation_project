package com.example.graduationproject.payment.repository;

import java.util.Optional;
import java.util.List;

import com.example.graduationproject.entity.Variant;
import com.example.graduationproject.entity.enums.VariantStatus;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

public interface VariantRepository extends MongoRepository<Variant, String> {

    Optional<Variant> findWithProductById(String id);

    Optional<Variant> findReadOnlyWithProductById(String id);

    Optional<Variant> findBySkuIgnoreCase(String sku);

    Optional<Variant> findFirstByProductIdAndStatusOrderByIdAsc(String productId, VariantStatus status);

    @Query("{ 'product': ?0 }")
    List<Variant> findByProductId(String productId);

    boolean existsBySkuIgnoreCase(String sku);

    boolean existsBySkuIgnoreCaseAndIdNot(String sku, String id);

    @Query("{ 'stockQuantity': { $lte: ?0 }, 'status': 'ACTIVE' }")
    List<Variant> findLowStockVariants(int threshold, Pageable pageable);
}
