package com.smartqueue.dto;

import com.smartqueue.model.UserRole;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateUserRoleRequest {
    @NotNull
    private UserRole role;
}
