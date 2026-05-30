package com.example.graduationproject.entity;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import com.example.graduationproject.entity.enums.OrderStatus;
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
@Document(collection = "orders")
@ToString(callSuper = true)
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
public class Order extends BaseEntity {

    private String orderCode;

    @ToString.Exclude
    @DocumentReference(lazy = true)
    private User user;

    @Builder.Default
    @ToString.Exclude
    @ReadOnlyProperty
    @DocumentReference(lazy = true, lookup = "{'order':?#{#self._id}}")
    private List<OrderItem> items = new ArrayList<>();

    @ToString.Exclude
    @DocumentReference(lazy = true)
    private Shipping shipping;

    @ToString.Exclude
    @DocumentReference(lazy = true)
    private Payment payment;

    @ToString.Exclude
    @DocumentReference(lazy = true)
    private Coupon coupon;

    @Builder.Default
    private OrderStatus status = OrderStatus.PENDING;

    private BigDecimal subtotalAmount;

    private BigDecimal discountAmount;

    private BigDecimal shippingFee;

    private BigDecimal finalPrice;

    private String note;
}
