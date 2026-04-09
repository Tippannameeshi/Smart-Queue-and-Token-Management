package com.smartqueue.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CounterTokenSummaryDTO {
    private Long id;
    private String tokenNumber;
    private String status;
    private String serviceType;
    private String priorityLevel;
}
