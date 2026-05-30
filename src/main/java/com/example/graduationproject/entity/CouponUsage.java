package com.example.graduationproject.entity;

import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DocumentReference;
import lombok.AllArgsConstructor;
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
@Document(collection = "coupon_usages")
@ToString(callSuper = true)
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
public class CouponUsage extends BaseEntity {

    @ToString.Exclude
    @DocumentReference(lazy = true)
    private Coupon coupon;

    @ToString.Exclude
    @DocumentReference(lazy = true)
    private User user;

    @ToString.Exclude
    @DocumentReference(lazy = true)
    private Order order;
}
