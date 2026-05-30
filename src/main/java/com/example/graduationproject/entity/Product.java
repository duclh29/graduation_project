package com.example.graduationproject.entity;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.Set;

import com.example.graduationproject.entity.enums.ProductStatus;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DocumentReference;
import org.springframework.data.annotation.ReadOnlyProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "products")
@ToString(callSuper = true)
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
public class Product extends BaseEntity {

    private String name;

    private String slug;

    @DocumentReference(lazy = true)
    private Brand brand;

    @DocumentReference(lazy = true)
    private Category category;

    private String description;

    private BigDecimal basePrice;

    private Integer totalQuantity;

    private String sizes;

    @Builder.Default
    private ProductStatus status = ProductStatus.DRAFT;

    private String imageUrl;

    @Builder.Default
    @ToString.Exclude
    @ReadOnlyProperty
    @DocumentReference(lazy = true, lookup = "{'product':?#{#self._id}}")
    private Set<Variant> variants = new HashSet<>();

    @Builder.Default
    @ToString.Exclude
    @DocumentReference(lazy = true)
    private Set<Promotion> promotions = new HashSet<>();
}
