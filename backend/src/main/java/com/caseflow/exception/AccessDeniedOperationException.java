package com.caseflow.exception;

public class AccessDeniedOperationException extends RuntimeException {
    public AccessDeniedOperationException(String message) {
        super(message);
    }
}
