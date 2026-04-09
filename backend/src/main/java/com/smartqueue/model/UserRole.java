package com.smartqueue.model;

public enum UserRole {
    CUSTOMER("GENERATE_TOKEN,VIEW_STATUS"),
    OPERATOR("CALL_TOKEN,UPDATE_STATUS"),
    MANAGER("MONITOR,CONFIGURE_PRIORITY"),
    ADMIN("FULL_ACCESS");

    private final String permissionLevel;

    UserRole(String permissionLevel) {
        this.permissionLevel = permissionLevel;
    }

    public String getPermissionLevel() {
        return permissionLevel;
    }

    public String getAuthority() {
        return "ROLE_" + name();
    }
}
