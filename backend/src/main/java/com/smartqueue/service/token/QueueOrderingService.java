package com.smartqueue.service.token;

import com.smartqueue.model.Token;
import java.util.List;

public interface QueueOrderingService {
    List<Token> orderTokens(List<Token> tokens);
}
