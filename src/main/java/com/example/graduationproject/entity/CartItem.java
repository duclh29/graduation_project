package com.example.graduationproject.entity;

import java.math.BigDecimal;

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
@Document(collection = "cart_items")
@ToString(callSuper = true)
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
public class CartItem extends BaseEntity {

    @ToString.Exclude
    @DocumentReference(lazy = true)
    private Cart cart;

    @ToString.Exclude
    @DocumentReference(lazy = true)
    private Variant variant;

    private Integer quantity;

    private BigDecimal unitPrice;
}
