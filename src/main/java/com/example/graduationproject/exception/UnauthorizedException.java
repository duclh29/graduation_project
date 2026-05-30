package com.example.graduationproject.exception;

public class UnauthorizedException extends BaseApiException {

    public UnauthorizedException(String message) {
        super(message, "UNAUTHORIZED");
    }
}
