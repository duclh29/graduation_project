package com.example.graduationproject.exception;

public class NotFoundException extends BaseApiException {

    public NotFoundException(String message) {
        super(message, "NOT_FOUND");
    }
}
