package com.smartqueue.service.token;

import com.smartqueue.dto.TokenResponseDTO;
import com.smartqueue.model.Token;
import com.smartqueue.model.TokenStatus;
import com.smartqueue.repository.FeedbackRepository;
import java.util.Map;
import org.springframework.stereotype.Component;

@Component
public class TokenResponseMapper {

    private final FeedbackRepository feedbackRepository;

    public TokenResponseMapper(FeedbackRepository feedbackRepository) {
        this.feedbackRepository = feedbackRepository;
    }

    public TokenResponseDTO toResponse(Token token, Map<Long, Integer> waitingPositions) {
        TokenResponseDTO dto = new TokenResponseDTO();
        dto.setId(token.getId());
        dto.setTokenNumber(token.getTokenNumber());
        dto.setStatus(token.getStatus().name());
        dto.setServiceType(token.getServiceType());
        dto.setTokenType(token.getTokenTypeName());
        dto.setPriorityLevel(token.getPriorityLevelName());
        dto.setWaitingPosition(waitingPositions.getOrDefault(token.getId(), 0));
        dto.setGeneratedAt(token.getGeneratedAt());
        dto.setCalledAt(token.getCalledAt());
        dto.setCompletedAt(token.getCompletedAt());
        dto.setLastNotifiedAt(token.getLastNotifiedAt());
        dto.setCurrentCounterName(token.getServiceCounter() != null ? token.getServiceCounter().getCounterName() : null);
        dto.setCurrentCounterNumber(token.getServiceCounter() != null ? token.getServiceCounter().getCounterNumber() : null);
        dto.setNotificationMessage(token.getLastNotificationMessage());
        dto.setCanSubmitFeedback(token.getStatus() == TokenStatus.COMPLETED && !feedbackRepository.existsByTokenId(token.getId()));
        dto.setFeedbackSubmitted(feedbackRepository.existsByTokenId(token.getId()));
        return dto;
    }
}
