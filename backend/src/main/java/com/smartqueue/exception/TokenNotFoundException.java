package com.smartqueue.exception;

public class TokenNotFoundException extends RuntimeException {
    public TokenNotFoundException(Long tokenId) {
        super("Token not found: " + tokenId);
    }
}
