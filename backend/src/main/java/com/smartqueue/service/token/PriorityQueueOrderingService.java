package com.smartqueue.service.token;

import com.smartqueue.model.Token;
import com.smartqueue.strategy.QueueStrategy;
import java.util.List;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

@Service
public class PriorityQueueOrderingService implements QueueOrderingService {

    private final QueueStrategy queueStrategy;

    public PriorityQueueOrderingService(@Qualifier("priority") QueueStrategy queueStrategy) {
        this.queueStrategy = queueStrategy;
    }

    @Override
    public List<Token> orderTokens(List<Token> tokens) {
        return queueStrategy.orderTokens(tokens);
    }
}
