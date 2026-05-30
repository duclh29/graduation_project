package com.example.graduationproject.product;

import com.example.graduationproject.entity.Product;
import com.example.graduationproject.entity.Variant;
import com.example.graduationproject.exception.NotFoundException;
import com.example.graduationproject.product.dto.ProductResponse;
import com.example.graduationproject.product.dto.ProductVariantResponse;
import com.example.graduationproject.payment.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    public Page<ProductResponse> searchProducts(String keyword, String brand, String brandId, String categoryId, String category,
                                                BigDecimal minPrice, BigDecimal maxPrice, Pageable pageable) {
        return productRepository.searchProducts(keyword, brand, brandId, categoryId, category, minPrice, maxPrice, pageable)
                .map(this::mapProduct);
    }

    public ProductResponse getProductDetail(String id) {
        Product product = productRepository.findWithVariantsById(id)
                .orElseThrow(() -> new NotFoundException("Product not found"));
        return mapProduct(product);
    }

    private ProductResponse mapProduct(Product product) {
        BigDecimal basePrice = product.getBasePrice() != null ? product.getBasePrice() : BigDecimal.ZERO;

        List<Variant> sortedVariants = product.getVariants().stream()
                .sorted(Comparator.comparing(Variant::getId))
                .toList();

        int calculatedTotalQuantity = sortedVariants.stream()
                .map(Variant::getStockQuantity)
                .filter(Objects::nonNull)
                .mapToInt(Integer::intValue)
                .sum();

        String calculatedSizes = sortedVariants.stream()
                .map(Variant::getSize)
                .filter(Objects::nonNull)
                .map(size -> size.getName())
                .filter(sizeName -> sizeName != null && !sizeName.isBlank())
                .distinct()
                .collect(Collectors.joining(", "));

        List<String> sizeOptions = sortedVariants.stream()
                .map(Variant::getSize)
                .filter(Objects::nonNull)
                .map(size -> size.getName())
                .filter(sizeName -> sizeName != null && !sizeName.isBlank())
                .map(String::trim)
                .distinct()
                .toList();

        Variant primaryVariant = sortedVariants.stream().findFirst().orElse(null);
        BigDecimal displayPrice = primaryVariant != null
                ? basePrice.add(primaryVariant.getAdditionalPrice() != null ? primaryVariant.getAdditionalPrice() : BigDecimal.ZERO)
                : basePrice;

        BigDecimal salePrice = displayPrice.multiply(new BigDecimal("0.9")).setScale(2, java.math.RoundingMode.HALF_UP);

        List<ProductVariantResponse> variants = sortedVariants.stream()
                .map(variant -> {
                    BigDecimal variantPrice = basePrice.add(variant.getAdditionalPrice() != null ? variant.getAdditionalPrice() : BigDecimal.ZERO);
                    BigDecimal variantSalePrice = variantPrice.multiply(new BigDecimal("0.9")).setScale(2, java.math.RoundingMode.HALF_UP);
                    return ProductVariantResponse.builder()
                        .id(variant.getId())
                        .sku(variant.getSku())
                        .color(variant.getColor())
                        .size(variant.getSize() != null ? variant.getSize().getName() : null)
                        .stockQuantity(variant.getStockQuantity())
                        .price(variantPrice)
                        .salePrice(variantSalePrice)
                        .imageUrl(variant.getImageUrl())
                        .build();
                })
                .toList();

        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .slug(product.getSlug())
                .brandId(product.getBrand() != null ? product.getBrand().getId() : null)
                .brand(product.getBrand() != null ? product.getBrand().getName() : null)
                .brandName(product.getBrand() != null ? product.getBrand().getName() : null)
                .categoryId(product.getCategory() != null ? product.getCategory().getId() : null)
                .category(product.getCategory() != null ? product.getCategory().getName() : null)
                .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
                .description(product.getDescription())
                .basePrice(basePrice)
                .price(displayPrice)
                .salePrice(salePrice)
                .totalQuantity(product.getTotalQuantity() != null ? product.getTotalQuantity() : calculatedTotalQuantity)
                .sizes(product.getSizes() != null && !product.getSizes().isBlank() ? product.getSizes() : calculatedSizes)
                .sizeOptions(sizeOptions)
                .imageUrl(product.getImageUrl() != null && !product.getImageUrl().isBlank() ? product.getImageUrl() : (primaryVariant != null ? primaryVariant.getImageUrl() : null))
                .thumbnailUrl(product.getImageUrl() != null && !product.getImageUrl().isBlank() ? product.getImageUrl() : (primaryVariant != null ? primaryVariant.getImageUrl() : null))
                .variants(variants)
                .build();
    }
}
