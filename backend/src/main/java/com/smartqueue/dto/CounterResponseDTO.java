package com.smartqueue.dto;

import com.smartqueue.model.CounterStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CounterResponseDTO {
    private Long id;
    private String counterName;
    private int counterNumber;
    private boolean active;
    private CounterStatus status;
    private CounterTokenSummaryDTO currentToken;
}
