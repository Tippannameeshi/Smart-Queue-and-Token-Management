package com.smartqueue.controller;

import com.smartqueue.dto.CreateUserRequest;
import com.smartqueue.dto.UpdateUserRoleRequest;
import com.smartqueue.dto.UserResponseDTO;
import com.smartqueue.service.UserService;
import jakarta.validation.Valid;
import java.util.List;
import java.security.Principal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
@PreAuthorize("hasRole('ADMIN')")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<List<UserResponseDTO>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @PostMapping
    public ResponseEntity<UserResponseDTO> createUser(@Valid @RequestBody CreateUserRequest request) {
        return ResponseEntity.ok(userService.createUser(request));
    }

    @PatchMapping("/{id}/role")
    public ResponseEntity<UserResponseDTO> updateRole(
        @PathVariable Long id,
        @Valid @RequestBody UpdateUserRoleRequest request,
        Principal principal
    ) {
        return ResponseEntity.ok(userService.updateUserRole(id, request.getRole(), principal.getName()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id, Principal principal) {
        userService.deleteUser(id, principal.getName());
        return ResponseEntity.noContent().build();
    }
}
