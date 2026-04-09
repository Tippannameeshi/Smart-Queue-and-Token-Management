package com.smartqueue.factory;

import com.smartqueue.model.PriorityLevel;
import com.smartqueue.model.PriorityToken;
import com.smartqueue.model.RegularToken;
import com.smartqueue.model.Token;
import org.springframework.stereotype.Component;

@Component
public class TokenFactory implements TokenCreator {

    @Override
    public Token createToken(String type, String priorityLevelStr) {
        if (type != null && type.equalsIgnoreCase("PRIORITY")) {
            PriorityToken t = new PriorityToken();
            PriorityLevel level;
            try {
                level = PriorityLevel.valueOf(priorityLevelStr.toUpperCase());
            } catch (Exception e) {
                level = PriorityLevel.REGULAR;
            }
            t.setPriorityLevel(level);
            return t;
        }
        return new RegularToken();
    }
}
