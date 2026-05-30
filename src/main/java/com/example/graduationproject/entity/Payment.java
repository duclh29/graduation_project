package com.example.graduationproject.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.example.graduationproject.entity.enums.PaymentMethod;
import com.example.graduationproject.entity.enums.PaymentStatus;
import org.springframework.data.mongodb.core.index.Indexed;
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
@Document(collection = "payments")
@ToString(callSuper = true)
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
public class Payment extends BaseEntity {

    @ToString.Exclude
    @DocumentReference(lazy = true)
    private Order order;

    @ToString.Exclude
    @DocumentReference(lazy = true)
    private User user;

    private PaymentMethod method;

    @Builder.Default
    private PaymentStatus status = PaymentStatus.PENDING;

    private BigDecimal amount;

    private String provider;

    @Indexed(unique = true)
    private String transactionCode;

    private LocalDateTime paidAt;

    private String note;
}
