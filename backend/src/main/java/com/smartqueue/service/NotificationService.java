package com.smartqueue.service;

import com.smartqueue.model.Token;
import java.time.LocalDateTime;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {
    public void notifyTokenCalled(Token token) {
        String counterName = token.getServiceCounter() != null
            ? token.getServiceCounter().getCounterName()
            : "the assigned counter";
        token.setLastNotificationMessage("Token " + token.getTokenNumber() + " has been called. Please proceed to " + counterName + ".");
        token.setLastNotifiedAt(LocalDateTime.now());
    }

    public void notifyStatusChanged(Token token) {
        String message = switch (token.getStatus()) {
            case WAITING -> "Token " + token.getTokenNumber() + " is waiting in the queue.";
            case CALLED -> "Token " + token.getTokenNumber() + " has been called.";
            case IN_SERVICE -> "Token " + token.getTokenNumber() + " is now in service.";
            case COMPLETED -> "Token " + token.getTokenNumber() + " has been completed.";
            case SKIPPED -> "Token " + token.getTokenNumber() + " has been skipped.";
            default -> "Token " + token.getTokenNumber() + " has a status update.";
        };
        token.setLastNotificationMessage(message);
        token.setLastNotifiedAt(LocalDateTime.now());
    }
}
