package com.smartqueue.strategy;

import com.smartqueue.model.Token;
import java.util.List;

public interface QueueStrategy {
    List<Token> orderTokens(List<Token> tokens);
    String getStrategyName();
}
