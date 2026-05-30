package com.example.graduationproject.auth.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class RegisterResponse {
    private String id;
    private String email;
    private String fullName;
}
