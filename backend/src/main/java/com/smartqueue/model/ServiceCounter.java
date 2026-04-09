package com.smartqueue.model;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "service_counters")
@Data
@NoArgsConstructor
public class ServiceCounter {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String counterName;
    private int counterNumber;
    private boolean isActive;

    @Enumerated(EnumType.STRING)
    private CounterStatus status;

    @ManyToOne
    @JoinColumn(name = "current_token_id")
    private Token currentToken;
}
