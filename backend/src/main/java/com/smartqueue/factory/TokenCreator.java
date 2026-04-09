package com.smartqueue.factory;

import com.smartqueue.model.Token;

public interface TokenCreator {
    Token createToken(String type, String priorityLevel);
}
