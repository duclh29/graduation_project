package com.example.graduationproject.entity;

import java.time.LocalDateTime;

import com.example.graduationproject.entity.enums.OrderStatus;
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
@Document(collection = "order_status_histories")
@ToString(callSuper = true)
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
public class OrderStatusHistory extends BaseEntity {

    @ToString.Exclude
    @DocumentReference(lazy = true)
    private Order order;

    private OrderStatus status;

    private String note;

    private String actorName;

    private LocalDateTime changedAt;
}
