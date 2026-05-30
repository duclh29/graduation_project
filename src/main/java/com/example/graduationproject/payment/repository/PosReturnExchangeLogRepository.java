package com.example.graduationproject.payment.repository;

import com.example.graduationproject.entity.PosReturnExchangeLog;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface PosReturnExchangeLogRepository extends MongoRepository<PosReturnExchangeLog, String> {
    List<PosReturnExchangeLog> findByOrderIdOrderByCreatedAtDesc(String orderId);
}
