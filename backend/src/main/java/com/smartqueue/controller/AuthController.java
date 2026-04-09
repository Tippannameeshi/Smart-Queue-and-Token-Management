package com.smartqueue.controller;

import com.smartqueue.dto.AuthResponseDTO;
import com.smartqueue.dto.LoginDTO;
import com.smartqueue.dto.RegisterDTO;
import com.smartqueue.dto.UserResponseDTO;
import com.smartqueue.model.User;
import com.smartqueue.service.UserService;
import com.smartqueue.service.auth.AuthTokenService;
import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final AuthTokenService authTokenService;

    public AuthController(UserService userService, AuthTokenService authTokenService) {
        this.userService = userService;
        this.authTokenService = authTokenService;
    }

    @GetMapping("/test")
    public ResponseEntity<Map<String, String>> test() {
        return ResponseEntity.ok(Map.of("message", "Auth API is working"));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@Valid @RequestBody LoginDTO dto) {
        User user = userService.authenticate(dto.getEmail(), dto.getPassword());
        String token = authTokenService.generateToken(user);
        return ResponseEntity.ok(new AuthResponseDTO(token, UserResponseDTO.from(user)));
    }

    @PostMapping("/register/customer")
    public ResponseEntity<AuthResponseDTO> registerCustomer(@Valid @RequestBody RegisterDTO dto) {
        User user = userService.registerCustomer(dto);
        String token = authTokenService.generateToken(user);
        return ResponseEntity.ok(new AuthResponseDTO(token, UserResponseDTO.from(user)));
    }
}
