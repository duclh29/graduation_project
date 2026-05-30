package com.example.graduationproject.payment.repository;

import com.example.graduationproject.entity.Product;
import com.example.graduationproject.entity.Brand;
import com.example.graduationproject.entity.Category;
import com.example.graduationproject.entity.Variant;
import com.example.graduationproject.entity.enums.ProductStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

public class ProductRepositoryImpl implements ProductRepositoryCustom {

    @Autowired
    private MongoTemplate mongoTemplate;

    @Override
    public Page<Product> searchAdminProducts(String keyword, ProductStatus status, String brandId, String sizeId, Pageable pageable) {
        Query query = new Query();
        List<Criteria> criterias = new ArrayList<>();

        if (status != null) {
            criterias.add(Criteria.where("status").is(status));
        }

        if (brandId != null && !brandId.isBlank()) {
            criterias.add(Criteria.where("brand").is(brandId));
        }

        if (keyword != null && !keyword.isBlank()) {
            Criteria keywordCriteria = new Criteria().orOperator(
                    Criteria.where("name").regex(keyword, "i"),
                    Criteria.where("slug").regex(keyword, "i")
            );
            criterias.add(keywordCriteria);
        }

        if (sizeId != null && !sizeId.isBlank()) {
            Query varQuery = new Query(Criteria.where("size").is(sizeId));
            List<String> productIds = mongoTemplate.find(varQuery, Variant.class).stream()
                    .map(v -> v.getProduct() != null ? v.getProduct().getId() : null)
                    .filter(Objects::nonNull)
                    .toList();
            criterias.add(Criteria.where("id").in(productIds));
        }

        if (!criterias.isEmpty()) {
            query.addCriteria(new Criteria().andOperator(criterias.toArray(new Criteria[0])));
        }

        long total = mongoTemplate.count(query, Product.class);
        query.with(pageable);
        List<Product> list = mongoTemplate.find(query, Product.class);
        return new PageImpl<>(list, pageable, total);
    }

    @Override
    public Page<Product> searchProducts(String keyword, String brand, String brandId, String categoryId, String category,
                                        BigDecimal minPrice, BigDecimal maxPrice, Pageable pageable) {
        Query query = new Query();
        List<Criteria> criterias = new ArrayList<>();

        // 1. Keyword search (name or slug)
        if (keyword != null && !keyword.isBlank()) {
            Criteria keywordCriteria = new Criteria().orOperator(
                    Criteria.where("name").regex(keyword, "i"),
                    Criteria.where("slug").regex(keyword, "i")
            );
            criterias.add(keywordCriteria);
        }

        // 2. Brand by Name
        if (brand != null && !brand.isBlank()) {
            Query brandQuery = new Query(Criteria.where("name").regex(brand, "i"));
            List<String> brandIds = mongoTemplate.find(brandQuery, Brand.class).stream()
                    .map(b -> b.getId())
                    .filter(Objects::nonNull)
                    .toList();
            criterias.add(Criteria.where("brand").in(brandIds));
        }

        // 3. Brand by ID
        if (brandId != null && !brandId.isBlank()) {
            criterias.add(Criteria.where("brand").is(brandId));
        }

        // 4. Category by ID
        if (categoryId != null && !categoryId.isBlank()) {
            criterias.add(Criteria.where("category").is(categoryId));
        }

        // 5. Category by Name
        if (category != null && !category.isBlank()) {
            Query catQuery = new Query(Criteria.where("name").regex(category, "i"));
            List<String> catIds = mongoTemplate.find(catQuery, Category.class).stream()
                    .map(c -> c.getId())
                    .filter(Objects::nonNull)
                    .toList();
            criterias.add(Criteria.where("category").in(catIds));
        }

        // 6. Min Price
        if (minPrice != null) {
            criterias.add(Criteria.where("basePrice").gte(minPrice));
        }

        // 7. Max Price
        if (maxPrice != null) {
            criterias.add(Criteria.where("basePrice").lte(maxPrice));
        }

        if (!criterias.isEmpty()) {
            query.addCriteria(new Criteria().andOperator(criterias.toArray(new Criteria[0])));
        }

        long total = mongoTemplate.count(query, Product.class);
        query.with(pageable);
        List<Product> list = mongoTemplate.find(query, Product.class);
        return new PageImpl<>(list, pageable, total);
    }
}
