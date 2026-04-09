package com.smartqueue.dto;

import com.smartqueue.model.User;
import com.smartqueue.model.UserRole;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserResponseDTO {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private UserRole role;
    private String permissionLevel;

    public static UserResponseDTO from(User user) {
        return new UserResponseDTO(
            user.getId(),
            user.getName(),
            user.getEmail(),
            user.getPhone(),
            user.getRole(),
            user.getPermissionLevel()
        );
    }
}
