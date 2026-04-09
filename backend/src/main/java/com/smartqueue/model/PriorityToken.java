package com.smartqueue.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;

@Entity
@DiscriminatorValue("PRIORITY")
public class PriorityToken extends Token {
    @Enumerated(EnumType.STRING)
    private PriorityLevel priorityLevel;

    public void setPriorityLevel(PriorityLevel priorityLevel) {
        this.priorityLevel = priorityLevel;
    }

    public PriorityLevel getPriorityLevel() {
        return priorityLevel;
    }

    @Override
    public int getPriorityScore() {
        return switch (priorityLevel) {
            case EMERGENCY -> 100;
            case SENIOR_CITIZEN -> 50;
            default -> 25;
        };
    }

    @Override
    public String getTokenPrefix() {
        return "P";
    }

    @Override
    public String getTokenTypeName() {
        return "PRIORITY";
    }

    @Override
    public String getPriorityLevelName() {
        return priorityLevel.name();
    }
}
