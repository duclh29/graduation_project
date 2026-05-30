package com.example.graduationproject.auth.dto;

import java.util.List;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AuthTokenResponse {
    private final String userId;
    private final String accessToken;
    private final String refreshToken;
    private final String tokenType;
    private final String email;
    private final List<String> roles;
    private final long expiresIn;
}
