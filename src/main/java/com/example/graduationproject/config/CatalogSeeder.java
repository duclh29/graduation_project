package com.example.graduationproject.config;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.example.graduationproject.entity.Brand;
import com.example.graduationproject.entity.Category;
import com.example.graduationproject.entity.Coupon;
import com.example.graduationproject.entity.Product;
import com.example.graduationproject.entity.Promotion;
import com.example.graduationproject.entity.Size;
import com.example.graduationproject.entity.Variant;
import com.example.graduationproject.entity.enums.CouponType;
import com.example.graduationproject.entity.enums.ProductStatus;
import com.example.graduationproject.entity.enums.PromotionStatus;
import com.example.graduationproject.entity.enums.PromotionType;
import com.example.graduationproject.payment.repository.BrandRepository;
import com.example.graduationproject.payment.repository.CategoryRepository;
import com.example.graduationproject.payment.repository.CouponRepository;
import com.example.graduationproject.payment.repository.ProductRepository;
import com.example.graduationproject.payment.repository.PromotionRepository;
import com.example.graduationproject.payment.repository.SizeRepository;
import com.example.graduationproject.payment.repository.VariantRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@Order(2)
@RequiredArgsConstructor
@Slf4j
public class CatalogSeeder implements CommandLineRunner {

    private final BrandRepository brandRepository;
    private final CategoryRepository categoryRepository;
    private final SizeRepository sizeRepository;
    private final ProductRepository productRepository;
    private final PromotionRepository promotionRepository;
    private final CouponRepository couponRepository;
    private final VariantRepository variantRepository;

    private static final String[] SAMPLE_PRODUCT_IMAGES = {
            "https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
            "https://images.unsplash.com/photo-1608231387042-66d1773070a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
            "https://images.unsplash.com/photo-1560769629-975ec94e6a86?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
            "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
            "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
            "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
            "https://images.unsplash.com/photo-1605348532760-6753d2c43329?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
            "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60"
    };

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (productRepository.count() >= 30) {
            backfillMissingProductImages();
            log.info("Catalog already seeded with products.");
            return;
        }

        seedBrands();
        seedCategories();
        seedSizes();
        seedCoupons();
        seedProducts();
        seedGlobalPromotion();
    }

    private void seedBrands() {
        String[] brands = {"Nike", "Adidas", "MLB", "Puma", "FILA", "New Balance", "Jeep"};
        for (String brandName : brands) {
            if (brandRepository.findByNameIgnoreCase(brandName).isEmpty()) {
                Brand brand = new Brand();
                brand.setName(brandName);
                brandRepository.save(brand);
            }
        }
    }

    private void seedCategories() {
        String[] categories = {"Sneakers", "Running", "Basketball", "Lifestyle", "Slip-on"};
        for (String catName : categories) {
            if (categoryRepository.findByName(catName).isEmpty()) {
                Category cat = new Category();
                cat.setName(catName);
                categoryRepository.save(cat);
            }
        }
    }

    private void seedSizes() {
        String[] sizes = {"35", "36", "37", "38", "39", "40", "41", "42", "43"};
        for (String sizeName : sizes) {
            if (sizeRepository.findByName(sizeName).isEmpty()) {
                Size size = new Size();
                size.setName(sizeName);
                sizeRepository.save(size);
            }
        }
    }

    private void seedCoupons() {
        if (couponRepository.count() == 0) {
            Coupon c1 = new Coupon();
            c1.setCode("GIAM50K");
            c1.setDescription("Giảm 50K cho đơn hàng từ 500K");
            c1.setType(CouponType.FIXED_AMOUNT);
            c1.setDiscountValue(new BigDecimal("50000"));
            c1.setMinimumOrderAmount(new BigDecimal("500000"));
            c1.setStartAt(LocalDateTime.now().minusDays(1));
            c1.setEndAt(LocalDateTime.now().plusMonths(1));
            c1.setStatus(com.example.graduationproject.entity.enums.CouponStatus.ACTIVE);
            c1.setUsageLimit(100);
            c1.setUsedCount(0);
            couponRepository.save(c1);

            Coupon c2 = new Coupon();
            c2.setCode("GIAM10PT");
            c2.setDescription("Giảm 10% tối đa 100K");
            c2.setType(CouponType.PERCENTAGE);
            c2.setDiscountValue(new BigDecimal("10"));
            c2.setMaxDiscountValue(new BigDecimal("100000"));
            c2.setMinimumOrderAmount(new BigDecimal("0"));
            c2.setStartAt(LocalDateTime.now().minusDays(1));
            c2.setEndAt(LocalDateTime.now().plusMonths(1));
            c2.setStatus(com.example.graduationproject.entity.enums.CouponStatus.ACTIVE);
            c2.setUsageLimit(200);
            c2.setUsedCount(0);
            couponRepository.save(c2);

            Coupon c3 = new Coupon();
            c3.setCode("FREESHIP");
            c3.setDescription("Miễn phí vận chuyển");
            c3.setType(CouponType.FREE_SHIPPING);
            c3.setDiscountValue(new BigDecimal("30000"));
            c3.setMinimumOrderAmount(new BigDecimal("1000000"));
            c3.setStartAt(LocalDateTime.now().minusDays(1));
            c3.setEndAt(LocalDateTime.now().plusMonths(1));
            c3.setStatus(com.example.graduationproject.entity.enums.CouponStatus.ACTIVE);
            c3.setUsageLimit(50);
            c3.setUsedCount(0);
            couponRepository.save(c3);
        }
    }

    private void seedProducts() {
        List<Brand> brands = brandRepository.findAll();
        List<Category> categories = categoryRepository.findAll();
        List<Size> sizes = sizeRepository.findAll();

        if (brands.isEmpty() || categories.isEmpty() || sizes.isEmpty()) {
            return;
        }

        for (int i = 1; i <= 30; i++) {
            Brand brand = brands.get(i % brands.size());
            Category category = categories.get(i % categories.size());
            String imageUrl = SAMPLE_PRODUCT_IMAGES[i % SAMPLE_PRODUCT_IMAGES.length];

            Product p = new Product();
            p.setName(brand.getName() + " Elite Series " + i);
            p.setSlug("elite-series-" + i + "-" + System.currentTimeMillis());
            p.setBrand(brand);
            p.setCategory(category);
            p.setDescription("Giày " + brand.getName() + " chính hãng chất lượng cao. Thiết kế hiện đại, trẻ trung, phù hợp với mọi hoạt động thể thao và đi chơi.");
            p.setBasePrice(new BigDecimal(1000000 + (i * 50000)));
            p.setStatus(ProductStatus.ACTIVE);
            p.setImageUrl(imageUrl);
            p.setSizes("39,40,41");
            p.setTotalQuantity(30);

            for (int j = 0; j < 3; j++) {
                Size size = sizes.get((i + j) % sizes.size());
                Variant v = new Variant();
                v.setProduct(p);
                v.setSku("SKU-" + i + "-" + j);
                v.setColor("Black/White");
                v.setSize(size);
                v.setStockQuantity(10);
                v.setAdditionalPrice(BigDecimal.ZERO);
                v.setImageUrl(imageUrl);
                p.getVariants().add(v);
            }

            productRepository.save(p);
            for (Variant v : p.getVariants()) {
                variantRepository.save(v);
            }
        }
        log.info("Seeded 30 products.");
    }

    private void backfillMissingProductImages() {
        List<Product> products = productRepository.findAll();
        int updatedProducts = 0;
        int updatedVariants = 0;

        for (Product product : products) {
            String fallbackImage = firstNonBlank(
                    product.getImageUrl(),
                    product.getVariants().stream()
                            .map(Variant::getImageUrl)
                            .filter(imageUrl -> !isBlank(imageUrl))
                            .findFirst()
                            .orElse(null)
            );
            if (isBlank(fallbackImage)) {
                int imageIndex = Math.floorMod((product.getName() != null ? product.getName() : product.getId()).hashCode(), SAMPLE_PRODUCT_IMAGES.length);
                fallbackImage = SAMPLE_PRODUCT_IMAGES[imageIndex];
            }

            if (isBlank(product.getImageUrl())) {
                product.setImageUrl(fallbackImage);
                productRepository.save(product);
                updatedProducts++;
            }

            for (Variant variant : product.getVariants()) {
                if (isBlank(variant.getImageUrl())) {
                    variant.setImageUrl(fallbackImage);
                    variantRepository.save(variant);
                    updatedVariants++;
                }
            }
        }

        if (updatedProducts > 0 || updatedVariants > 0) {
            log.info("Backfilled missing product images: {} products, {} variants.", updatedProducts, updatedVariants);
        }
    }

    private String firstNonBlank(String... values) {
        for (String value : values) {
            if (!isBlank(value)) {
                return value;
            }
        }
        return null;
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private void seedGlobalPromotion() {
        if (!promotionRepository.existsByCodeIgnoreCase("GLOBAL10")) {
            Promotion p = new Promotion();
            p.setName("Giảm 10% Toàn Bộ Sản Phẩm");
            p.setCode("GLOBAL10");
            p.setDescription("Chương trình giảm giá tự động 10% cho tất cả sản phẩm trên hệ thống");
            p.setType(PromotionType.PERCENTAGE);
            p.setDiscountValue(new BigDecimal("10"));
            p.setStartAt(LocalDateTime.now().minusDays(1));
            p.setEndAt(LocalDateTime.now().plusYears(1));
            p.setStatus(PromotionStatus.ACTIVE);
            
            // Link to all products
            List<Product> allProducts = productRepository.findAll();
            p.setProducts(new HashSet<>(allProducts));
            
            promotionRepository.save(p);
            log.info("Seeded Global 10% Promotion linked to {} products.", allProducts.size());
        }
    }
}
