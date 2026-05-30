package com.example.graduationproject.payment.repository;

import com.example.graduationproject.entity.Product;
import org.springframework.data.mongodb.repository.MongoRepository;
import com.example.graduationproject.entity.enums.ProductStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.data.mongodb.repository.Aggregation;
import com.example.graduationproject.admin.dashboard.dto.AdminCategoryStatsProjection;
import java.util.Optional;
import java.util.List;

public interface ProductRepository extends MongoRepository<Product, String>, ProductRepositoryCustom {

    @Aggregation(pipeline = {
        "{ $lookup: { from: 'categories', localField: 'category', foreignField: '_id', as: 'category_doc' } }",
        "{ $unwind: '$category_doc' }",
        "{ $group: { _id: '$category_doc.name', value: { $sum: 1 } } }",
        "{ $project: { name: '$_id', value: '$value', _id: 0 } }"
    })
    List<AdminCategoryStatsProjection> getProductCountByCategory();

    Optional<Product> findWithVariantsById(String id);

    boolean existsBySlugIgnoreCase(String slug);

    boolean existsBySlugIgnoreCaseAndIdNot(String slug, String id);
}

