package com.example.graduationproject.admin.product;

import com.example.graduationproject.admin.product.dto.AdminProductMetaResponse;
import com.example.graduationproject.admin.product.dto.AdminProductResponse;
import com.example.graduationproject.admin.product.dto.AdminProductUpsertRequest;
import com.example.graduationproject.admin.product.dto.AdminLookupItemResponse;
import com.example.graduationproject.common.api.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/products")
@RequiredArgsConstructor
public class AdminProductController {

    private final AdminProductService adminProductService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<AdminProductResponse>>> getProducts(
            @RequestParam(name = "keyword", required = false) String keyword,
            @RequestParam(name = "status", required = false) String status,
            @RequestParam(name = "brandId", required = false) String brandId,
            @RequestParam(name = "sizeId", required = false) String sizeId,
            Pageable pageable
    ) {
        return ResponseEntity.ok(ApiResponse.success("Admin products fetched successfully", adminProductService.getProducts(keyword, status, brandId, sizeId, pageable)));
    }

    @GetMapping("/meta")
    public ResponseEntity<ApiResponse<AdminProductMetaResponse>> getMeta() {
        return ResponseEntity.ok(ApiResponse.success("Admin product metadata fetched successfully", adminProductService.getMeta()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AdminProductResponse>> getProduct(@PathVariable("id") String id) {
        return ResponseEntity.ok(ApiResponse.success("Admin product detail fetched successfully", adminProductService.getProduct(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AdminProductResponse>> createProduct(@Valid @RequestBody AdminProductUpsertRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Admin product created successfully", adminProductService.createProduct(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AdminProductResponse>> updateProduct(@PathVariable("id") String id,
                                                                           @Valid @RequestBody AdminProductUpsertRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Admin product updated successfully", adminProductService.updateProduct(id, request)));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<AdminProductResponse>> updateStatus(@PathVariable("id") String id,
                                                                          @RequestBody Map<String, String> request) {
        return ResponseEntity.ok(ApiResponse.success("Admin product status updated successfully", adminProductService.updateStatus(id, request.get("status"))));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(@PathVariable("id") String id) {
        adminProductService.deleteProduct(id);
        return ResponseEntity.ok(ApiResponse.success("Admin product deleted successfully", null));
    }

    @PostMapping("/brands")
    public ResponseEntity<ApiResponse<AdminLookupItemResponse>> createBrand(@RequestBody Map<String, String> request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Brand created successfully", adminProductService.createBrand(request.get("name"))));
    }

    @PostMapping("/categories")
    public ResponseEntity<ApiResponse<AdminLookupItemResponse>> createCategory(@RequestBody Map<String, String> request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Category created successfully", adminProductService.createCategory(request.get("name"))));
    }
}
