package com.example.graduationproject.payment.repository;

import com.example.graduationproject.entity.PosPaymentAllocation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Aggregation;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public interface PosPaymentAllocationRepository extends MongoRepository<PosPaymentAllocation, String>, PosPaymentAllocationRepositoryCustom {
    List<PosPaymentAllocation> findByOrderId(String orderId);

    List<PosPaymentAllocation> findByOrderIdIn(List<String> orderIds);
}
