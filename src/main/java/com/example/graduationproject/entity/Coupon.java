package com.example.graduationproject.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

import com.example.graduationproject.entity.enums.CouponStatus;
import com.example.graduationproject.entity.enums.CouponType;
import org.springframework.data.annotation.ReadOnlyProperty;
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
@Document(collection = "coupons")
@ToString(callSuper = true)
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
public class Coupon extends BaseEntity {

    private String code;

    private String description;

    private CouponType type;

    @Builder.Default
    private CouponStatus status = CouponStatus.UPCOMING;

    private BigDecimal discountValue;

    private BigDecimal maxDiscountValue;

    private BigDecimal minimumOrderAmount;

    private LocalDateTime startAt;

    private LocalDateTime endAt;

    private Integer usageLimit;

    @Builder.Default
    private Integer usedCount = 0;

    @Builder.Default
    @ToString.Exclude
    @DocumentReference(lazy = true)
    private Set<User> users = new HashSet<>();

    @Builder.Default
    @ToString.Exclude
    @ReadOnlyProperty
    @DocumentReference(lazy = true, lookup = "{'coupon':?#{#self._id}}")
    private Set<Order> orders = new HashSet<>();

    @Builder.Default
    @ToString.Exclude
    @ReadOnlyProperty
    @DocumentReference(lazy = true, lookup = "{'coupon':?#{#self._id}}")
    private Set<Cart> carts = new HashSet<>();
}
