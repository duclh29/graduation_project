package com.example.graduationproject.entity;

import com.example.graduationproject.entity.enums.PaymentMethod;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DocumentReference;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;

@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "pos_payment_allocations")
@ToString(callSuper = true)
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
public class PosPaymentAllocation extends BaseEntity {

    @ToString.Exclude
    @DocumentReference(lazy = true)
    private Order order;

    private PaymentMethod method;

    private BigDecimal amount;

    private BigDecimal cashReceived;

    private BigDecimal changeAmount;

    private String referenceCode;

    private String note;
}
