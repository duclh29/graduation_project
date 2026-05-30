package com.example.graduationproject.product;

import com.example.graduationproject.common.api.ApiResponse;
import com.example.graduationproject.product.dto.ProductResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<ProductResponse>>> searchProducts(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) String brandId,
            @RequestParam(required = false) String categoryId,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @PageableDefault(size = 10, sort = "createdAt") Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success("Products fetched successfully",
                productService.searchProducts(keyword, brand, brandId, categoryId, category, minPrice, maxPrice, pageable)));
    }

    @GetMapping("/_debug")
    public ResponseEntity<ApiResponse<Map<String, Object>>> debugProductsEndpoint() {
        return ResponseEntity.ok(ApiResponse.success("Product debug endpoint is reachable", Map.of(
                "service", "graduationproject",
                "endpoint", "/api/products/_debug",
                "time", LocalDateTime.now().toString()
        )));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductResponse>> getProductDetail(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success("Product detail fetched successfully", productService.getProductDetail(id)));
    }
}
