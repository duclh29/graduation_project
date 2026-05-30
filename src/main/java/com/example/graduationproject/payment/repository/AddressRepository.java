package com.example.graduationproject.payment.repository;

import java.util.Optional;
import java.util.List;

import com.example.graduationproject.entity.Address;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface AddressRepository extends MongoRepository<Address, String> {
    Optional<Address> findByIdAndUserId(String id, String userId);
    List<Address> findByUserIdOrderByCreatedAtDesc(String userId);
    Optional<Address> findFirstByUserIdOrderByCreatedAtDesc(String userId);
}
