package com.example.graduationproject.auth.service;

import com.example.graduationproject.auth.dto.AuthTokenResponse;
import com.example.graduationproject.auth.dto.LoginRequest;
import com.example.graduationproject.auth.dto.LogoutRequest;
import com.example.graduationproject.auth.dto.RefreshTokenRequest;
import com.example.graduationproject.auth.dto.RegisterRequest;
import com.example.graduationproject.auth.dto.RegisterResponse;
import com.example.graduationproject.entity.BlacklistedToken;
import com.example.graduationproject.entity.RefreshToken;
import com.example.graduationproject.entity.Role;
import com.example.graduationproject.entity.User;
import com.example.graduationproject.entity.enums.RoleName;
import com.example.graduationproject.entity.enums.UserStatus;
import com.example.graduationproject.exception.BadRequestException;
import com.example.graduationproject.exception.UnauthorizedException;
import com.example.graduationproject.payment.repository.BlacklistedTokenRepository;
import com.example.graduationproject.payment.repository.RefreshTokenRepository;
import com.example.graduationproject.payment.repository.RoleRepository;
import com.example.graduationproject.payment.repository.UserRepository;
import com.example.graduationproject.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final RefreshTokenRepository refreshTokenRepository;
    private final BlacklistedTokenRepository blacklistedTokenRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.rate-limit.login.max-attempts}")
    private int maxAttempts;

    @Value("${app.rate-limit.login.window-seconds}")
    private int windowSeconds;

    private final ConcurrentHashMap<String, AttemptWindow> loginAttempts = new ConcurrentHashMap<>();

    @Transactional
    public RegisterResponse register(RegisterRequest request) {
        String normalizedFullName = request.getFullName().trim();
        String normalizedEmail = request.getEmail().trim().toLowerCase();
        String normalizedPhone = request.getPhoneNumber().trim();
        log.info("Register attempt for email={}", normalizedEmail);

        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new BadRequestException("Email already exists");
        }

        if (userRepository.existsByPhoneNumber(normalizedPhone)) {
            throw new BadRequestException("Phone number already exists");
        }

        Role customerRole = roleRepository.findByName(RoleName.CUSTOMER)
                .orElseThrow(() -> new BadRequestException("Default role CUSTOMER not found"));

        User user = User.builder()
                .fullName(normalizedFullName)
                .email(normalizedEmail)
                .password(passwordEncoder.encode(request.getPassword()))
                .phoneNumber(normalizedPhone)
                .status(UserStatus.ACTIVE)
                .roles(new HashSet<>(List.of(customerRole)))
                .build();

        User savedUser = userRepository.save(user);
        log.info("User {} registered successfully", savedUser.getEmail());

        return RegisterResponse.builder()
                .id(savedUser.getId())
                .email(savedUser.getEmail())
                .fullName(savedUser.getFullName())
                .build();
    }

    @Transactional
    public AuthTokenResponse login(LoginRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();
        enforceRateLimit(normalizedEmail);
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(normalizedEmail, request.getPassword())
            );
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            User user = userRepository.findByEmail(userDetails.getUsername())
                    .orElseThrow(() -> new UnauthorizedException("User not found"));

            String accessToken = jwtUtil.generateAccessToken(userDetails);
            String refreshToken = jwtUtil.generateRefreshToken(userDetails);
            refreshTokenRepository.save(RefreshToken.builder()
                    .token(refreshToken)
                    .user(user)
                    .expiresAt(jwtUtil.extractRefreshExpiration(refreshToken))
                    .revoked(false)
                    .build());

            loginAttempts.remove(normalizedEmail);
            log.info("User {} logged in successfully", normalizedEmail);

            return buildAuthResponse(user, userDetails, accessToken, refreshToken);
        } catch (BadCredentialsException ex) {
            registerFailedAttempt(normalizedEmail);
            log.warn("Failed login attempt for {}", normalizedEmail);
            throw new UnauthorizedException("Invalid email or password");
        }
    }

    @Transactional
    public AuthTokenResponse refreshToken(RefreshTokenRequest request) {
        RefreshToken storedToken = refreshTokenRepository.findByTokenAndRevokedFalse(request.getRefreshToken())
                .orElseThrow(() -> new UnauthorizedException("Refresh token is invalid"));

        if (storedToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            storedToken.setRevoked(true);
            throw new UnauthorizedException("Refresh token has expired");
        }

        User user = storedToken.getUser();
        UserDetails userDetails = org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getPassword())
                .authorities(user.getRoles().stream().map(role -> "ROLE_" + role.getName().name()).toArray(String[]::new))
                .build();

        if (!jwtUtil.isRefreshTokenValid(request.getRefreshToken(), userDetails)) {
            throw new UnauthorizedException("Refresh token is invalid");
        }

        String accessToken = jwtUtil.generateAccessToken(userDetails);
        String refreshToken = jwtUtil.generateRefreshToken(userDetails);
        storedToken.setRevoked(true);
        refreshTokenRepository.save(RefreshToken.builder()
                .token(refreshToken)
                .user(user)
                .expiresAt(jwtUtil.extractRefreshExpiration(refreshToken))
                .revoked(false)
                .build());

        return buildAuthResponse(user, userDetails, accessToken, refreshToken);
    }

    @Transactional
    public void logout(String accessToken, LogoutRequest request) {
        if (accessToken != null && !accessToken.isBlank()) {
            blacklistedTokenRepository.save(BlacklistedToken.builder()
                    .token(accessToken)
                    .expiresAt(jwtUtil.extractAccessExpiration(accessToken))
                    .build());
        }

        if (request != null && request.getRefreshToken() != null) {
            refreshTokenRepository.findByTokenAndRevokedFalse(request.getRefreshToken())
                    .ifPresent(token -> token.setRevoked(true));
        }
    }

    public boolean isBlacklisted(String token) {
        return blacklistedTokenRepository.existsByToken(token);
    }

    private AuthTokenResponse buildAuthResponse(User user, UserDetails userDetails, String accessToken, String refreshToken) {
        return AuthTokenResponse.builder()
                .userId(user.getId())
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .email(userDetails.getUsername())
                .roles(userDetails.getAuthorities().stream().map(GrantedAuthority::getAuthority).toList())
                .expiresIn(jwtUtil.getAccessExpiration())
                .build();
    }

    private void enforceRateLimit(String email) {
        AttemptWindow window = loginAttempts.get(email);
        if (window != null && window.expiresAt().isAfter(LocalDateTime.now()) && window.count() >= maxAttempts) {
            throw new BadRequestException("Too many login attempts. Please try again later");
        }
    }

    private void registerFailedAttempt(String email) {
        loginAttempts.compute(email, (key, current) -> {
            if (current == null || current.expiresAt().isBefore(LocalDateTime.now())) {
                return new AttemptWindow(1, LocalDateTime.now().plusSeconds(windowSeconds));
            }
            return new AttemptWindow(current.count() + 1, current.expiresAt());
        });
    }

    private record AttemptWindow(int count, LocalDateTime expiresAt) {
    }
}
