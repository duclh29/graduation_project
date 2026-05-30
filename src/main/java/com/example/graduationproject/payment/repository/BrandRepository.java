package com.example.graduationproject.payment.repository;

import com.example.graduationproject.entity.Brand;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface BrandRepository extends MongoRepository<Brand, String> {
    Optional<Brand> findByNameIgnoreCase(String name);
}
