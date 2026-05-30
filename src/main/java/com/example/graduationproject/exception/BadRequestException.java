package com.example.graduationproject.exception;

public class BadRequestException extends BaseApiException {

    public BadRequestException(String message) {
        super(message, "BAD_REQUEST");
    }
}
