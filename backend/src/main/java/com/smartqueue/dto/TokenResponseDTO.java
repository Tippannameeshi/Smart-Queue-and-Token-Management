package com.smartqueue.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class TokenResponseDTO {
    private Long id;
    private String tokenNumber;
    private String status;
    private String serviceType;
    private String tokenType;
    private String priorityLevel;
    private int waitingPosition;
    private LocalDateTime generatedAt;
    private LocalDateTime calledAt;
    private LocalDateTime completedAt;
    private LocalDateTime lastNotifiedAt;
    private String currentCounterName;
    private Integer currentCounterNumber;
    private String notificationMessage;
    private boolean canSubmitFeedback;
    private boolean feedbackSubmitted;
}
