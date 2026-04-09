package com.smartqueue.service.token;

import com.smartqueue.model.TokenStatus;
import java.util.Map;
import java.util.Set;
import org.springframework.stereotype.Component;

@Component
public class TokenStateTransitionPolicy {

    private final Map<TokenStatus, Set<TokenStatus>> allowedTransitions = Map.of(
        TokenStatus.WAITING, Set.of(TokenStatus.CALLED, TokenStatus.SKIPPED),
        TokenStatus.CALLED, Set.of(TokenStatus.IN_SERVICE, TokenStatus.SKIPPED),
        TokenStatus.IN_SERVICE, Set.of(TokenStatus.COMPLETED)
    );

    public void validateTransition(TokenStatus current, TokenStatus next) {
        if (!allowedTransitions.getOrDefault(current, Set.of()).contains(next)) {
            throw new IllegalStateException("Invalid state transition: " + current + " -> " + next);
        }
    }
}
