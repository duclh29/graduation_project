package com.example.graduationproject.entity;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.Set;

import com.example.graduationproject.entity.enums.VariantStatus;
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
@Document(collection = "variants")
@ToString(callSuper = true)
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
public class Variant extends BaseEntity {

    @ToString.Exclude
    @DocumentReference(lazy = true)
    private Product product;

    private String sku;

    private String color;

    @DocumentReference(lazy = true)
    private Size size;

    private Integer stockQuantity;

    private BigDecimal additionalPrice;

    private String imageUrl;

    @Builder.Default
    private VariantStatus status = VariantStatus.ACTIVE;

    @Builder.Default
    @ToString.Exclude
    @ReadOnlyProperty
    @DocumentReference(lazy = true, lookup = "{'variant':?#{#self._id}}")
    private Set<CartItem> cartItems = new HashSet<>();

    @Builder.Default
    @ToString.Exclude
    @ReadOnlyProperty
    @DocumentReference(lazy = true, lookup = "{'variant':?#{#self._id}}")
    private Set<OrderItem> orderItems = new HashSet<>();

    @Builder.Default
    @ToString.Exclude
    @DocumentReference(lazy = true)
    private Set<Promotion> promotions = new HashSet<>();
}
