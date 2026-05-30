package com.example.graduationproject.payment.repository;

import com.example.graduationproject.entity.OrderStatusHistory;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface OrderStatusHistoryRepository extends MongoRepository<OrderStatusHistory, String> {
    List<OrderStatusHistory> findByOrderIdOrderByChangedAtDesc(String orderId);
}
