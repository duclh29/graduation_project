package com.example.graduationproject.payment.repository;

import com.example.graduationproject.entity.CashierSession;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface CashierSessionRepository extends MongoRepository<CashierSession, String> {
    Optional<CashierSession> findFirstByStatusOrderByOpenedAtDesc(String status);
}
