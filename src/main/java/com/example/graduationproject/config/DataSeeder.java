package com.example.graduationproject.config;

import java.util.HashSet;
import java.util.Set;

import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.example.graduationproject.entity.Role;
import com.example.graduationproject.entity.User;
import com.example.graduationproject.entity.enums.RoleName;
import com.example.graduationproject.entity.enums.UserStatus;
import com.example.graduationproject.payment.repository.RoleRepository;
import com.example.graduationproject.payment.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@Order(1)
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        seedRoles();
        seedAdminUser();
        seedStaffUsers();
    }

    private void seedRoles() {
        for (RoleName roleName : RoleName.values()) {
            if (roleRepository.findByName(roleName).isEmpty()) {
                roleRepository.save(Role.builder()
                        .name(roleName)
                        .description("System Role: " + roleName.name())
                        .build());
                log.info("Seeded Role: {}", roleName);
            }
        }
    }

    private void seedAdminUser() {
        String adminEmail = "admin@admin.com";
        if (!userRepository.existsByEmailIgnoreCase(adminEmail)) {
            Role adminRole = roleRepository.findByName(RoleName.ADMIN)
                    .orElseThrow(() -> new IllegalStateException("ADMIN role not found after seeding"));
            
            Set<Role> roles = new HashSet<>();
            roles.add(adminRole);

            User adminUser = User.builder()
                    .fullName("System Admin")
                    .email(adminEmail)
                    .phoneNumber("0123456789")
                    .password(passwordEncoder.encode("admin123"))
                    .status(UserStatus.ACTIVE)
                    .roles(roles)
                    .build();

            userRepository.save(adminUser);
            log.info("Seeded Admin User: {}", adminEmail);
        } else {
            log.info("Admin User already exists: {}", adminEmail);
        }
    }

    private void seedStaffUsers() {
        Role staffRole = roleRepository.findByName(RoleName.STAFF)
                .orElseThrow(() -> new IllegalStateException("STAFF role not found after seeding"));

        createStaffUserIfMissing("Nguyen Van An", "staff.an@local.com", "0901000001", staffRole);
        createStaffUserIfMissing("Tran Thi Binh", "staff.binh@local.com", "0901000002", staffRole);
    }

    private void createStaffUserIfMissing(String fullName, String email, String phoneNumber, Role staffRole) {
        if (userRepository.existsByEmailIgnoreCase(email)) {
            log.info("Staff User already exists: {}", email);
            return;
        }

        User staffUser = User.builder()
                .fullName(fullName)
                .email(email)
                .phoneNumber(phoneNumber)
                .avatarUrl("https://api.dicebear.com/8.x/initials/svg?seed=" + fullName.replace(" ", "%20"))
                .password(passwordEncoder.encode("staff123"))
                .status(UserStatus.ACTIVE)
                .roles(Set.of(staffRole))
                .build();

        userRepository.save(staffUser);
        log.info("Seeded Staff User: {}", email);
    }
}
