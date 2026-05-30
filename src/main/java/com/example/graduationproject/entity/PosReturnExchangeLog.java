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

import java.math.BigDecimal;

@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "pos_return_exchange_logs")
@ToString(callSuper = true)
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
public class PosReturnExchangeLog extends BaseEntity {

    @ToString.Exclude
    @DocumentReference(lazy = true)
    private Order order;

    private String type;

    private BigDecimal returnedAmount;

    private BigDecimal exchangeAmount;

    private BigDecimal balanceAmount;

    private String detailJson;

    private String note;
}
