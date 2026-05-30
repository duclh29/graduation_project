package com.example.graduationproject.payment.repository;

import com.example.graduationproject.entity.Order;
import com.example.graduationproject.entity.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends MongoRepository<Order, String>, OrderRepositoryCustom {

    List<Order> findByUserIdOrderByCreatedAtDesc(String userId);

    Optional<Order> findDetailedById(String id);

    long countByStatusNot(OrderStatus status);


    List<Order> findTop5ByOrderByCreatedAtDesc();

    List<Order> findByStatusAndCreatedAtLessThan(OrderStatus status, LocalDateTime dateTime);
}
