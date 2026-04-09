package com.smartqueue.controller;

import com.smartqueue.dto.TokenRequestDTO;
import com.smartqueue.model.TokenStatus;
import com.smartqueue.service.TokenService;
import com.smartqueue.service.UserService;
import java.security.Principal;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/tokens")
@CrossOrigin(origins = "http://localhost:5173")
public class TokenController {

    private final TokenService tokenService;
    private final UserService userService;

    public TokenController(TokenService tokenService, UserService userService) {
        this.tokenService = tokenService;
        this.userService = userService;
    }

    @PostMapping("/generate")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> generate(@RequestBody TokenRequestDTO request, Principal principal) {
        Long customerId = userService.getUserByEmail(principal.getName()).getId();
        return ResponseEntity.ok(tokenService.generateToken(request, customerId));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> myTokens(Principal principal) {
        Long customerId = userService.getUserByEmail(principal.getName()).getId();
        return ResponseEntity.ok(tokenService.getTokensForCustomer(customerId));
    }

    @GetMapping("/queue")
    public ResponseEntity<?> queue() {
        return ResponseEntity.ok(tokenService.getOrderedQueue());
    }

    @GetMapping("/status/{tokenNumber}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> status(@PathVariable String tokenNumber, Principal principal) {
        return ResponseEntity.ok(tokenService.getByTokenNumber(tokenNumber, principal.getName()));
    }

    @PostMapping("/call-next/{counterId}")
    @PreAuthorize("hasAnyRole('OPERATOR','ADMIN')")
    public ResponseEntity<?> callNext(@PathVariable Long counterId) {
        return ResponseEntity.ok(tokenService.callNextToken(counterId));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('OPERATOR','ADMIN')")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        TokenStatus status = TokenStatus.valueOf(body.get("status"));
        return ResponseEntity.ok(tokenService.updateTokenStatus(id, status));
    }

    @PatchMapping("/{id}/skip")
    @PreAuthorize("hasAnyRole('OPERATOR','ADMIN')")
    public ResponseEntity<?> skip(@PathVariable Long id) {
        return ResponseEntity.ok(tokenService.updateTokenStatus(id, TokenStatus.SKIPPED));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> deleteToken(@PathVariable Long id, Principal principal) {
        tokenService.deleteCustomerToken(id, principal.getName());
        return ResponseEntity.noContent().build();
    }
}
