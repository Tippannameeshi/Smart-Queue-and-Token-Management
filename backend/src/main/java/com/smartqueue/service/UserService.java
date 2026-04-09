package com.smartqueue.service;

import com.smartqueue.dto.CreateUserRequest;
import com.smartqueue.dto.RegisterDTO;
import com.smartqueue.dto.UserResponseDTO;
import com.smartqueue.model.User;
import com.smartqueue.model.UserRole;
import com.smartqueue.repository.UserRepository;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    public User authenticate(String email, String password) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        return user;
    }

    public User register(User user) {
        ensureEmailAvailable(user.getEmail(), null);
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setPhone(normalizePhone(user.getPhone()));
        user.setRole(user.getRole() != null ? user.getRole() : UserRole.CUSTOMER);
        return userRepository.save(user);
    }

    public User registerCustomer(RegisterDTO dto) {
        ensureEmailAvailable(dto.getEmail(), null);

        User customer = new User();
        customer.setName(dto.getName());
        customer.setEmail(dto.getEmail());
        customer.setPhone(normalizePhone(dto.getPhone()));
        customer.setPassword(passwordEncoder.encode(dto.getPassword()));
        customer.setRole(UserRole.CUSTOMER);

        return userRepository.save(customer);
    }

    public UserResponseDTO createUser(CreateUserRequest request) {
        ensureEmailAvailable(request.getEmail(), null);

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhone(normalizePhone(request.getPhone()));
        user.setRole(request.getRole());

        return UserResponseDTO.from(userRepository.save(user));
    }

    public UserResponseDTO updateUserRole(Long userId, UserRole role, String currentUserEmail) {
        User user = getUserById(userId);
        if (user.getEmail().equalsIgnoreCase(currentUserEmail)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Your own admin role cannot be changed");
        }
        user.setRole(role);
        return UserResponseDTO.from(userRepository.save(user));
    }

    public void deleteUser(Long userId, String currentUserEmail) {
        User user = getUserById(userId);
        if (user.getEmail().equalsIgnoreCase(currentUserEmail)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Your own admin account cannot be deleted");
        }
        userRepository.delete(user);
    }

    public List<UserResponseDTO> getAllUsers() {
        return userRepository.findAll().stream()
            .map(UserResponseDTO::from)
            .collect(Collectors.toList());
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    public User getUserById(Long userId) {
        return userRepository.findById(userId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    private void ensureEmailAvailable(String email, Long currentUserId) {
        userRepository.findByEmail(email).ifPresent(existingUser -> {
            if (currentUserId == null || !existingUser.getId().equals(currentUserId)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "An account with this email already exists");
            }
        });
    }

    private String normalizePhone(String phone) {
        return phone == null ? "" : phone.trim();
    }
}
