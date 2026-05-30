package com.example.graduationproject.exception;

import lombok.Getter;

@Getter
public abstract class BaseApiException extends RuntimeException {

    private final String errorCode;

    protected BaseApiException(String message, String errorCode) {
        super(message);
        this.errorCode = errorCode;
    }
}
