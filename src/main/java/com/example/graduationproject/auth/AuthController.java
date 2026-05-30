package com.example.graduationproject.auth;

import com.example.graduationproject.auth.dto.AuthTokenResponse;
import com.example.graduationproject.auth.dto.LoginRequest;
import com.example.graduationproject.auth.dto.LogoutRequest;
import com.example.graduationproject.auth.dto.RefreshTokenRequest;
import com.example.graduationproject.auth.dto.RegisterRequest;
import com.example.graduationproject.auth.dto.RegisterResponse;
import com.example.graduationproject.auth.service.AuthService;
import com.example.graduationproject.common.api.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthTokenResponse>> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Login successful", authService.login(request)));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthTokenResponse>> refresh(@RequestBody RefreshTokenRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Token refreshed successfully", authService.refreshToken(request)));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestBody(required = false) LogoutRequest request
    ) {
        String accessToken = null;
        if (authorization != null && authorization.startsWith("Bearer ")) {
            accessToken = authorization.substring(7).trim();
        }
        authService.logout(accessToken, request);
        return ResponseEntity.ok(ApiResponse.success("Logout successful", null));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<RegisterResponse>> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Register successful", authService.register(request)));
    }

    @PostMapping("/_debug-build")
    public ResponseEntity<ApiResponse<String>> debugBuild() {
        return ResponseEntity.ok(ApiResponse.success("Auth debug endpoint is reachable", "graduationproject-debug-ok"));
    }
}
