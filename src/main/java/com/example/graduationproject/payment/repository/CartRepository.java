package com.example.graduationproject.payment.repository;

import java.util.Optional;

import com.example.graduationproject.entity.Cart;
import com.example.graduationproject.entity.enums.CartStatus;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface CartRepository extends MongoRepository<Cart, String> {

    Optional<Cart> findByUserIdAndStatus(String userId, CartStatus status);

    Optional<Cart> findWithDetailsByUserIdAndStatus(String userId, CartStatus status);
}
