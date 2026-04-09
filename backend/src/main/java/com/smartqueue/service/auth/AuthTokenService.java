package com.smartqueue.service.auth;

import com.smartqueue.model.User;
import org.springframework.security.core.userdetails.UserDetails;

public interface AuthTokenService {
    String generateToken(User user);
    String extractEmail(String token);
    boolean isTokenValid(String token, UserDetails userDetails);
}
