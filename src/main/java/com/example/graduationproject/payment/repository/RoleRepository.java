package com.example.graduationproject.payment.repository;

import com.example.graduationproject.entity.Role;
import com.example.graduationproject.entity.enums.RoleName;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface RoleRepository extends MongoRepository<Role, String> {
    Optional<Role> findByName(RoleName name);
}
