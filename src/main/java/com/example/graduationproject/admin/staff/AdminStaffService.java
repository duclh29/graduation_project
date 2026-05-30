package com.example.graduationproject.admin.staff;

import com.example.graduationproject.admin.staff.dto.AdminStaffRequest;
import com.example.graduationproject.admin.staff.dto.AdminStaffResponse;
import com.example.graduationproject.entity.Role;
import com.example.graduationproject.entity.User;
import com.example.graduationproject.entity.enums.RoleName;
import com.example.graduationproject.entity.enums.UserStatus;
import com.example.graduationproject.exception.BadRequestException;
import com.example.graduationproject.exception.NotFoundException;
import com.example.graduationproject.payment.repository.RoleRepository;
import com.example.graduationproject.payment.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminStaffService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public Page<AdminStaffResponse> getStaffs(String keyword, String status, Pageable pageable) {
        UserStatus userStatus = parseStatus(status);
        return userRepository.searchAdminUsers(normalize(keyword), userStatus, RoleName.STAFF, pageable)
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public AdminStaffResponse getStaff(String id) {
        User user = userRepository.findAdminUserById(id, RoleName.STAFF)
                .orElseThrow(() -> new NotFoundException("Staff not found with id: " + id));
        return toResponse(user);
    }

    @Transactional
    public AdminStaffResponse createStaff(AdminStaffRequest request) {
        String email = normalizeRequired(request.getEmail(), "Email is required").toLowerCase();
        String phoneNumber = normalizeRequired(request.getPhoneNumber(), "Phone number is required");
        String fullName = normalizeRequired(request.getFullName(), "Full name is required");
        String password = normalizeRequired(request.getPassword(), "Password is required");

        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new BadRequestException("Email is already taken");
        }
        if (userRepository.existsByPhoneNumber(phoneNumber)) {
            throw new BadRequestException("Phone number is already taken");
        }

        Role staffRole = roleRepository.findByName(RoleName.STAFF)
                .orElseThrow(() -> new RuntimeException("Error: Role STAFF is not found."));

        User user = User.builder()
                .fullName(fullName)
                .email(email)
                .phoneNumber(phoneNumber)
                .avatarUrl(normalize(request.getAvatarUrl()))
                .password(passwordEncoder.encode(password))
                .status(parseCreateStatus(request.getStatus()))
                .roles(Set.of(staffRole))
                .build();

        userRepository.save(user);
        return toResponse(user);
    }

    @Transactional
    public AdminStaffResponse updateStatus(String id, String status) {
        User user = userRepository.findAdminUserById(id, RoleName.STAFF)
                .orElseThrow(() -> new NotFoundException("Staff not found with id: " + id));

        user.setStatus(parseRequiredStatus(status));
        userRepository.save(user);
        return toResponse(user);
    }

    private AdminStaffResponse toResponse(User user) {
        return AdminStaffResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .avatarUrl(user.getAvatarUrl())
                .status(user.getStatus() != null ? user.getStatus().name() : null)
                .roles(user.getRoles().stream()
                        .map(role -> role.getName().name())
                        .collect(Collectors.toList()))
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }

    private String normalize(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }

    private String normalizeRequired(String value, String message) {
        String normalized = normalize(value);
        if (normalized == null) {
            throw new BadRequestException(message);
        }
        return normalized;
    }

    private UserStatus parseStatus(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return UserStatus.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Invalid user status: " + value);
        }
    }

    private UserStatus parseRequiredStatus(String value) {
        if (value == null || value.isBlank()) {
            throw new BadRequestException("User status is required");
        }
        try {
            return UserStatus.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Invalid user status: " + value);
        }
    }

    private UserStatus parseCreateStatus(String value) {
        if (value == null || value.isBlank()) {
            return UserStatus.ACTIVE;
        }
        return parseRequiredStatus(value);
    }
}
