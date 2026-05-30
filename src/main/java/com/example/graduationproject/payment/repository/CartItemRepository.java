package com.example.graduationproject.payment.repository;

import com.example.graduationproject.entity.CartItem;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CartItemRepository extends MongoRepository<CartItem, String> {
    void deleteByCartId(String cartId);
}
