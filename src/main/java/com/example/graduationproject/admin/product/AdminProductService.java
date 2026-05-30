package com.example.graduationproject.admin.product;

import com.example.graduationproject.admin.product.dto.AdminProductMetaResponse;
import com.example.graduationproject.admin.product.dto.AdminProductResponse;
import com.example.graduationproject.admin.product.dto.AdminProductUpsertRequest;
import com.example.graduationproject.admin.product.dto.AdminLookupItemResponse;
import com.example.graduationproject.admin.product.dto.AdminProductVariantRequest;
import com.example.graduationproject.admin.product.dto.AdminProductVariantResponse;
import com.example.graduationproject.entity.Product;
import com.example.graduationproject.entity.Brand;
import com.example.graduationproject.entity.Category;
import com.example.graduationproject.entity.Size;
import com.example.graduationproject.entity.Variant;
import com.example.graduationproject.entity.enums.ProductStatus;
import com.example.graduationproject.entity.enums.VariantStatus;
import com.example.graduationproject.exception.BadRequestException;
import com.example.graduationproject.exception.NotFoundException;
import com.example.graduationproject.payment.repository.ProductRepository;
import com.example.graduationproject.payment.repository.BrandRepository;
import com.example.graduationproject.payment.repository.CategoryRepository;
import com.example.graduationproject.payment.repository.SizeRepository;
import com.example.graduationproject.payment.repository.VariantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;
import java.util.HashSet;
import java.util.Map;
import java.util.ArrayList;
import java.util.Objects;
import java.util.Comparator;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminProductService {

    private final ProductRepository productRepository;
    private final BrandRepository brandRepository;
    private final CategoryRepository categoryRepository;
    private final SizeRepository sizeRepository;
    private final VariantRepository variantRepository;

    @Transactional(readOnly = true)
    public Page<AdminProductResponse> getProducts(String keyword, String status, String brandId, String sizeId, Pageable pageable) {
        ProductStatus productStatus = parseProductStatus(status, true);
        return productRepository.searchAdminProducts(normalize(keyword), productStatus, brandId, sizeId, pageable)
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public AdminProductResponse getProduct(String id) {
        return toResponse(findProduct(id));
    }

    @Transactional(readOnly = true)
    public AdminProductMetaResponse getMeta() {
        List<AdminLookupItemResponse> brands = brandRepository.findAll().stream()
                .map(item -> AdminLookupItemResponse.builder().id(item.getId()).name(item.getName()).build())
                .toList();
        List<AdminLookupItemResponse> categories = categoryRepository.findAll().stream()
                .map(item -> AdminLookupItemResponse.builder().id(item.getId()).name(item.getName()).build())
                .toList();
        List<AdminLookupItemResponse> sizes = sizeRepository.findAll().stream()
                .map(item -> AdminLookupItemResponse.builder().id(item.getId()).name(item.getName()).build())
                .toList();
        return AdminProductMetaResponse.builder().brands(brands).categories(categories).sizes(sizes).build();
    }

    @Transactional
    public AdminProductResponse createProduct(AdminProductUpsertRequest request) {
        validateProductRequest(request, null);
        Product product = new Product();
        applyProductFields(product, request);
        product = productRepository.save(product);
        syncProductVariants(product, request);
        recalculateProduct(product);
        return toResponse(productRepository.save(product));
    }

    @Transactional
    public AdminProductResponse updateProduct(String id, AdminProductUpsertRequest request) {
        Product product = findProduct(id);
        validateProductRequest(request, id);
        applyProductFields(product, request);
        syncProductVariants(product, request);
        recalculateProduct(product);
        return toResponse(productRepository.save(product));
    }

    @Transactional
    public AdminProductResponse updateStatus(String id, String status) {
        Product product = findProduct(id);
        product.setStatus(parseProductStatus(status, false));
        return toResponse(productRepository.save(product));
    }

    @Transactional
    public void deleteProduct(String id) {
        Product product = findProduct(id);
        List<Variant> variants = variantRepository.findByProductId(product.getId());
        if (!variants.isEmpty()) {
            variantRepository.deleteAll(variants);
        }
        productRepository.delete(product);
    }

    @Transactional
    public AdminLookupItemResponse createBrand(String name) {
        if (name == null || name.isBlank()) {
            throw new BadRequestException("Brand name is required");
        }
        if (brandRepository.findByNameIgnoreCase(name.trim()).isPresent()) {
            throw new BadRequestException("Brand already exists");
        }
        Brand brand = brandRepository.save(Brand.builder().name(name.trim()).build());
        return AdminLookupItemResponse.builder().id(brand.getId()).name(brand.getName()).build();
    }

    @Transactional
    public AdminLookupItemResponse createCategory(String name) {
        if (name == null || name.isBlank()) {
            throw new BadRequestException("Category name is required");
        }
        if (categoryRepository.findByName(name.trim()).isPresent()) {
            throw new BadRequestException("Category already exists");
        }
        Category category = categoryRepository.save(Category.builder().name(name.trim()).build());
        return AdminLookupItemResponse.builder().id(category.getId()).name(category.getName()).build();
    }

    private void validateProductRequest(AdminProductUpsertRequest request, String productId) {
        if (productId == null) {
            if (productRepository.existsBySlugIgnoreCase(request.getSlug())) {
                throw new BadRequestException("Product slug already exists");
            }
        } else if (productRepository.existsBySlugIgnoreCaseAndIdNot(request.getSlug(), productId)) {
            throw new BadRequestException("Product slug already exists");
        }

        Set<String> seenSkus = new HashSet<>();
        for (AdminProductVariantRequest variant : request.getVariants()) {
            String normalizedSku = variant.getSku().trim().toLowerCase();
            if (!seenSkus.add(normalizedSku)) {
                throw new BadRequestException("Duplicate SKU in request: " + variant.getSku());
            }
            if (variant.getId() == null) {
                if (variantRepository.existsBySkuIgnoreCase(variant.getSku())) {
                    throw new BadRequestException("Variant SKU already exists: " + variant.getSku());
                }
            } else if (variantRepository.existsBySkuIgnoreCaseAndIdNot(variant.getSku(), variant.getId())) {
                throw new BadRequestException("Variant SKU already exists: " + variant.getSku());
            }
        }
    }

    private void applyProductFields(Product product, AdminProductUpsertRequest request) {
        Brand brand = brandRepository.findById(request.getBrandId())
                .orElseThrow(() -> new NotFoundException("Brand not found"));
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new NotFoundException("Category not found"));

        product.setName(request.getName().trim());
        product.setSlug(request.getSlug().trim());
        product.setBrand(brand);
        product.setCategory(category);
        product.setDescription(request.getDescription());
        product.setBasePrice(request.getBasePrice().setScale(2, java.math.RoundingMode.HALF_UP));
        product.setStatus(parseProductStatus(request.getStatus(), false));
        product.setImageUrl(request.getImageUrl());
    }

    private void syncProductVariants(Product product, AdminProductUpsertRequest request) {
        Map<String, Variant> existing = product.getVariants().stream()
                .filter(variant -> variant.getId() != null)
                .collect(Collectors.toMap(Variant::getId, variant -> variant));

        List<Variant> nextVariants = new ArrayList<>();
        for (AdminProductVariantRequest item : request.getVariants()) {
            Variant variant = item.getId() != null ? existing.getOrDefault(item.getId(), new Variant()) : new Variant();
            Size size = resolveSize(item.getSize());
            variant.setProduct(product);
            variant.setSku(item.getSku().trim());
            variant.setColor(item.getColor().trim());
            variant.setSize(size);
            variant.setStockQuantity(item.getStockQuantity());
            variant.setAdditionalPrice(item.getAdditionalPrice().setScale(2, java.math.RoundingMode.HALF_UP));
            variant.setImageUrl(item.getImageUrl());
            variant.setStatus(parseVariantStatus(item.getStatus()));
            nextVariants.add(variant);
        }

        Set<String> nextIds = nextVariants.stream()
                .map(Variant::getId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
        List<Variant> removedVariants = existing.values().stream()
                .filter(variant -> variant.getId() != null && !nextIds.contains(variant.getId()))
                .toList();
        if (!removedVariants.isEmpty()) {
            variantRepository.deleteAll(removedVariants);
        }

        List<Variant> savedVariants = variantRepository.saveAll(nextVariants);
        product.getVariants().clear();
        product.getVariants().addAll(savedVariants);
    }

    private void recalculateProduct(Product product) {
        int totalQuantity = product.getVariants().stream()
                .map(Variant::getStockQuantity)
                .filter(Objects::nonNull)
                .mapToInt(Integer::intValue)
                .sum();
        String sizes = product.getVariants().stream()
                .map(Variant::getSize)
                .filter(Objects::nonNull)
                .map(Size::getName)
                .filter(Objects::nonNull)
                .map(String::trim)
                .distinct()
                .collect(Collectors.joining(", "));
        product.setTotalQuantity(totalQuantity);
        product.setSizes(sizes);
    }

    private Size resolveSize(String sizeName) {
        String normalized = sizeName == null ? null : sizeName.trim();
        if (normalized == null || normalized.isBlank()) {
            throw new BadRequestException("Variant size is required");
        }
        return sizeRepository.findByName(normalized)
                .orElseGet(() -> sizeRepository.save(Size.builder().name(normalized).build()));
    }

    private Product findProduct(String id) {
        return productRepository.findWithVariantsById(id)
                .orElseThrow(() -> new NotFoundException("Product not found with id: " + id));
    }

    private AdminProductResponse toResponse(Product product) {
        List<Variant> sortedVariants = product.getVariants().stream()
                .sorted(Comparator.comparing(Variant::getId, Comparator.nullsLast(String::compareTo)))
                .toList();
        String imageUrl = product.getImageUrl() != null && !product.getImageUrl().isBlank() 
                ? product.getImageUrl() 
                : sortedVariants.stream().map(Variant::getImageUrl).filter(Objects::nonNull).findFirst().orElse(null);
        List<AdminProductVariantResponse> variants = sortedVariants.stream()
                .map(variant -> AdminProductVariantResponse.builder()
                        .id(variant.getId())
                        .sku(variant.getSku())
                        .color(variant.getColor())
                        .size(variant.getSize() != null ? variant.getSize().getName() : null)
                        .stockQuantity(variant.getStockQuantity())
                        .additionalPrice(variant.getAdditionalPrice())
                        .price((product.getBasePrice() != null ? product.getBasePrice() : BigDecimal.ZERO).add(variant.getAdditionalPrice() != null ? variant.getAdditionalPrice() : BigDecimal.ZERO))
                        .imageUrl(variant.getImageUrl())
                        .status(variant.getStatus() != null ? variant.getStatus().name() : null)
                        .build())
                .toList();
        return AdminProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .slug(product.getSlug())
                .brandId(product.getBrand() != null ? product.getBrand().getId() : null)
                .brandName(product.getBrand() != null ? product.getBrand().getName() : null)
                .categoryId(product.getCategory() != null ? product.getCategory().getId() : null)
                .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
                .description(product.getDescription())
                .basePrice(product.getBasePrice())
                .totalQuantity(product.getTotalQuantity())
                .sizes(product.getSizes())
                .status(product.getStatus() != null ? product.getStatus().name() : null)
                .imageUrl(imageUrl)
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .variants(variants)
                .build();
    }

    private String normalize(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }

    private ProductStatus parseProductStatus(String status, boolean allowNull) {
        if (status == null || status.isBlank()) {
            if (allowNull) {
                return null;
            }
            throw new BadRequestException("Product status is required");
        }
        try {
            return ProductStatus.valueOf(status.trim().toUpperCase());
        } catch (Exception ex) {
            throw new BadRequestException("Invalid product status: " + status);
        }
    }

    private VariantStatus parseVariantStatus(String status) {
        if (status == null || status.isBlank()) {
            return VariantStatus.ACTIVE;
        }
        try {
            return VariantStatus.valueOf(status.trim().toUpperCase());
        } catch (Exception ex) {
            throw new BadRequestException("Invalid variant status: " + status);
        }
    }
}
