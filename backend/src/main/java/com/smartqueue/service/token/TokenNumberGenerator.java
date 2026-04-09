package com.smartqueue.service.token;

import com.smartqueue.model.Token;
import com.smartqueue.repository.TokenRepository;
import org.springframework.stereotype.Component;

@Component
public class TokenNumberGenerator {

    private final TokenRepository tokenRepository;

    public TokenNumberGenerator(TokenRepository tokenRepository) {
        this.tokenRepository = tokenRepository;
    }

    public String generate(String serviceType, Token token) {
        long count = tokenRepository.count() + 1;
        String serviceCode = serviceType == null || serviceType.isBlank()
            ? "GEN"
            : serviceType.trim().substring(0, Math.min(3, serviceType.trim().length())).toUpperCase();
        return token.getTokenPrefix() + "-" + serviceCode + "-" + String.format("%03d", count);
    }
}
