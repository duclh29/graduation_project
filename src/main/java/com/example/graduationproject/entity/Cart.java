package com.example.graduationproject.entity;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import com.example.graduationproject.entity.enums.CartStatus;
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
@Document(collection = "carts")
@ToString(callSuper = true)
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
public class Cart extends BaseEntity {

    @ToString.Exclude
    @DocumentReference(lazy = true)
    private User user;

    @Builder.Default
    @ToString.Exclude
    @ReadOnlyProperty
    @DocumentReference(lazy = true, lookup = "{'cart':?#{#self._id}}")
    private List<CartItem> items = new ArrayList<>();

    @ToString.Exclude
    @DocumentReference(lazy = true)
    private Coupon coupon;

    @Builder.Default
    private CartStatus status = CartStatus.ACTIVE;

    private BigDecimal totalPrice;
}
