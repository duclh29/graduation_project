package com.example.graduationproject.payment.repository;

import com.example.graduationproject.entity.Product;
import com.example.graduationproject.entity.enums.ProductStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.math.BigDecimal;

public interface ProductRepositoryCustom {
    Page<Product> searchAdminProducts(String keyword, ProductStatus status, String brandId, String sizeId, Pageable pageable);
    
    Page<Product> searchProducts(String keyword, String brand, String brandId, String categoryId, String category,
                                 BigDecimal minPrice, BigDecimal maxPrice, Pageable pageable);
}
