package com.example.graduationproject.entity;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import com.example.graduationproject.entity.enums.UserStatus;
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
@Document(collection = "users")
@ToString(callSuper = true)
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
public class User extends BaseEntity {

    private String fullName;

    private String email;

    private String password;

    private String phoneNumber;

    private String avatarUrl;

    @Builder.Default
    private UserStatus status = UserStatus.ACTIVE;

    @Builder.Default
    @ToString.Exclude
    @DocumentReference(lazy = true)
    private Set<Role> roles = new HashSet<>();

    @ToString.Exclude
    @ReadOnlyProperty
    @DocumentReference(lazy = true, lookup = "{'user':?#{#self._id}}")
    private Cart cart;

    @Builder.Default
    @ToString.Exclude
    @ReadOnlyProperty
    @DocumentReference(lazy = true, lookup = "{'user':?#{#self._id}}")
    private List<Order> orders = new ArrayList<>();

    @Builder.Default
    @ToString.Exclude
    @ReadOnlyProperty
    @DocumentReference(lazy = true, lookup = "{'user':?#{#self._id}}")
    private List<Shipping> shippings = new ArrayList<>();

    @Builder.Default
    @ToString.Exclude
    @ReadOnlyProperty
    @DocumentReference(lazy = true, lookup = "{'user':?#{#self._id}}")
    private List<Payment> payments = new ArrayList<>();

    @Builder.Default
    @ToString.Exclude
    @DocumentReference(lazy = true)
    private Set<Coupon> coupons = new HashSet<>();
}
