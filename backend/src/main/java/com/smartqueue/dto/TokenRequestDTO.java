package com.smartqueue.dto;

import lombok.Data;

@Data
public class TokenRequestDTO {
    private Long customerId;
    private String serviceType;
    private String tokenType;
    private String priorityLevel;
}