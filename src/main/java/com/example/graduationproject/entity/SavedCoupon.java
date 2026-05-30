package com.example.graduationproject.entity;

import org.springframework.data.mongodb.core.index.CompoundIndex;
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
@Document(collection = "saved_coupons")
@CompoundIndex(name = "user_coupon_idx", def = "{'user': 1, 'coupon': 1}", unique = true)
@ToString(callSuper = true)
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
public class SavedCoupon extends BaseEntity {

    @ToString.Exclude
    @DocumentReference(lazy = true)
    private User user;

    @ToString.Exclude
    @DocumentReference(lazy = true)
    private Coupon coupon;
}
