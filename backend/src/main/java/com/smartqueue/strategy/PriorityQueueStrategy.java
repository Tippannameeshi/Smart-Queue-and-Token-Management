package com.smartqueue.strategy;

import com.smartqueue.model.Token;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;

@Component("priority")
public class PriorityQueueStrategy implements QueueStrategy {
    @Override
    public List<Token> orderTokens(List<Token> tokens) {
        return tokens.stream()
            .sorted(
                Comparator.comparingInt(Token::getPriorityScore)
                    .reversed()
                    .thenComparing(Token::getGeneratedAt)
            )
            .collect(Collectors.toList());
    }

    @Override
    public String getStrategyName() {
        return "PRIORITY_FIFO";
    }
}
