package com.example.graduationproject.payment.repository;

import com.example.graduationproject.entity.User;
import com.example.graduationproject.entity.enums.RoleName;
import com.example.graduationproject.entity.enums.UserStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.Optional;

public interface UserRepositoryCustom {
    Page<User> searchAdminUsers(String keyword, UserStatus status, RoleName roleName, Pageable pageable);
    Optional<User> findAdminUserById(String id, RoleName roleName);
}
