package com.smartqueue.strategy;

import com.smartqueue.model.Token;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;

@Component("regular")
public class RegularQueueStrategy implements QueueStrategy {
    @Override
    public List<Token> orderTokens(List<Token> tokens) {
        return tokens.stream()
            .sorted(Comparator.comparing(Token::getGeneratedAt))
            .collect(Collectors.toList());
    }

    @Override
    public String getStrategyName() {
        return "FIFO";
    }
}
