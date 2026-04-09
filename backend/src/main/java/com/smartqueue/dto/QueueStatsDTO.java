package com.smartqueue.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class QueueStatsDTO {
    private long totalTokens;
    private long waitingTokens;
    private long calledTokens;
    private long inServiceTokens;
    private long completedTokens;
    private long skippedTokens;
    private long priorityTokens;
    private long totalUsers;
    private long activeCounters;
    private long totalCounters;
}
