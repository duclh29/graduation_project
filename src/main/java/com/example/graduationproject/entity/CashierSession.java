package com.example.graduationproject.entity;

import org.springframework.data.mongodb.core.mapping.Document;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "cashier_sessions")
@ToString(callSuper = true)
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
public class CashierSession extends BaseEntity {

    private String cashierName;

    private LocalDateTime openedAt;

    private LocalDateTime closedAt;

    private BigDecimal openingCash;

    private BigDecimal closingCash;

    private String status;

    private String note;
}
