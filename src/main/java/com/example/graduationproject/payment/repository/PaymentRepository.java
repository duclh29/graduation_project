package com.example.graduationproject.payment.repository;

import com.example.graduationproject.entity.Payment;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface PaymentRepository extends MongoRepository<Payment, String> {
    Optional<Payment> findByProviderAndTransactionCode(String provider, String transactionCode);

    Optional<Payment> findByOrderId(String orderId);
}

