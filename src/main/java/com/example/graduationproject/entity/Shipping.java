package com.example.graduationproject.entity;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import com.example.graduationproject.entity.enums.ShippingMethod;
import com.example.graduationproject.entity.enums.ShippingStatus;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DocumentReference;
import org.springframework.data.mongodb.core.index.Indexed;
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
@Document(collection = "shippings")
@ToString(callSuper = true)
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
public class Shipping extends BaseEntity {

    @ToString.Exclude
    @DocumentReference(lazy = true)
    private Order order;

    @ToString.Exclude
    @DocumentReference(lazy = true)
    private User user;

    private String recipientName;

    private String phoneNumber;

    private String addressLine;

    private String ward;

    private String district;

    private String city;

    private String country;

    private String postalCode;

    @Builder.Default
    private ShippingMethod method = ShippingMethod.STANDARD;

    @Builder.Default
    private ShippingStatus status = ShippingStatus.PENDING;

    private BigDecimal shippingFee;

    @Indexed(unique = true, sparse = true)
    private String trackingNumber;

    private LocalDate expectedDeliveryDate;

    private LocalDateTime shippedAt;

    private LocalDateTime deliveredAt;

    private String note;
}
