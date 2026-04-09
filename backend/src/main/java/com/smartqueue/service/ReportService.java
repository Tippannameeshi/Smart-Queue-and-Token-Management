package com.smartqueue.service;

import com.smartqueue.dto.QueueStatsDTO;
import com.smartqueue.model.CounterStatus;
import com.smartqueue.model.PriorityToken;
import com.smartqueue.model.TokenStatus;
import com.smartqueue.repository.CounterRepository;
import com.smartqueue.repository.TokenRepository;
import com.smartqueue.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ReportService {

    @Autowired
    private TokenRepository tokenRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CounterRepository counterRepository;

    public QueueStatsDTO getQueueStats() {
        long totalTokens = tokenRepository.count();
        long waitingTokens = tokenRepository.countByStatus(TokenStatus.WAITING);
        long calledTokens = tokenRepository.countByStatus(TokenStatus.CALLED);
        long inServiceTokens = tokenRepository.countByStatus(TokenStatus.IN_SERVICE);
        long completedTokens = tokenRepository.countByStatus(TokenStatus.COMPLETED);
        long skippedTokens = tokenRepository.countByStatus(TokenStatus.SKIPPED);
        long priorityTokens = tokenRepository.findAll().stream()
            .filter(PriorityToken.class::isInstance)
            .count();
        long totalUsers = userRepository.count();
        long totalCounters = counterRepository.count();
        long activeCounters = counterRepository.findAll().stream()
            .filter(counter -> counter.isActive() && counter.getStatus() == CounterStatus.OPEN)
            .count();

        return new QueueStatsDTO(
            totalTokens,
            waitingTokens,
            calledTokens,
            inServiceTokens,
            completedTokens,
            skippedTokens,
            priorityTokens,
            totalUsers,
            activeCounters,
            totalCounters
        );
    }
}
