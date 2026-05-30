package com.example.graduationproject.auth.dto;

import com.example.graduationproject.common.validation.ValidPassword;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterRequest {

    @NotBlank(message = "Full name is required")
    @Size(max = 150, message = "Full name must be at most 150 characters")
    private String fullName;

    @Email(message = "Email is not valid")
    @NotBlank(message = "Email is required")
    @Size(max = 150, message = "Email must be at most 150 characters")
    private String email;

    @ValidPassword
    private String password;

    @NotBlank(message = "Phone number is required")
    @Size(max = 20, message = "Phone number must be at most 20 characters")
    private String phoneNumber;
}
