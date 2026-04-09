package com.smartqueue.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

@Entity
@DiscriminatorValue("REGULAR")
public class RegularToken extends Token {
    @Override
    public int getPriorityScore() {
        return 0;
    }

    @Override
    public String getTokenPrefix() {
        return "R";
    }
}
