package com.example.graduationproject.payment.repository;

import com.example.graduationproject.entity.Size;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface SizeRepository extends MongoRepository<Size, String> {
    Optional<Size> findByName(String name);
}
