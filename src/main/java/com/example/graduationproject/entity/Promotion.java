package com.example.graduationproject.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

import com.example.graduationproject.entity.enums.PromotionStatus;
import com.example.graduationproject.entity.enums.PromotionType;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DocumentReference;
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
@Document(collection = "promotions")
@ToString(callSuper = true)
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
public class Promotion extends BaseEntity {

    private String name;

    private String code;

    private String description;

    private PromotionType type;

    @Builder.Default
    private PromotionStatus status = PromotionStatus.UPCOMING;

    private BigDecimal discountValue;

    private BigDecimal maxDiscountValue;

    private LocalDateTime startAt;

    private LocalDateTime endAt;

    @Builder.Default
    @ToString.Exclude
    @DocumentReference(lazy = true)
    private Set<Product> products = new HashSet<>();

    @Builder.Default
    @ToString.Exclude
    @DocumentReference(lazy = true)
    private Set<Variant> variants = new HashSet<>();
}
