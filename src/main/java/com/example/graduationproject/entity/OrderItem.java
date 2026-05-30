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
@Document(collection = "order_items")
@ToString(callSuper = true)
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
public class OrderItem extends BaseEntity {

    @ToString.Exclude
    @DocumentReference(lazy = true)
    private Order order;

    @ToString.Exclude
    @DocumentReference(lazy = true)
    private Variant variant;

    private String productName;

    private String skuSnapshot;

    private String sizeSnapshot;

    private String colorSnapshot;

    private Integer quantity;

    @lombok.Builder.Default
    private Integer returnedQuantity = 0;

    @lombok.Builder.Default
    private Integer requestedReturnQuantity = 0;

    private BigDecimal unitPrice;

    private BigDecimal totalPrice;
}
