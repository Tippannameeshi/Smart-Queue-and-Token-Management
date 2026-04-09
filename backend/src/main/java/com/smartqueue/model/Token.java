package com.smartqueue.model;

import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorColumn;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Inheritance;
import jakarta.persistence.InheritanceType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "tokens")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "token_type")
@Data
@NoArgsConstructor
public abstract class Token {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String tokenNumber;

    @Enumerated(EnumType.STRING)
    private TokenStatus status;

    @ManyToOne
    @JoinColumn(name = "customer_id")
    private User customer;

    @ManyToOne
    @JoinColumn(name = "counter_id")
    private ServiceCounter serviceCounter;

    @Column
    private String serviceType;

    private LocalDateTime generatedAt;
    private LocalDateTime calledAt;
    private LocalDateTime completedAt;
    private LocalDateTime lastNotifiedAt;
    private int waitingPosition;
    private String lastNotificationMessage;

    public abstract int getPriorityScore();
    public abstract String getTokenPrefix();

    public String getTokenTypeName() {
        return "REGULAR";
    }

    public String getPriorityLevelName() {
        return "REGULAR";
    }
}
