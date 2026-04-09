package com.smartqueue.repository;

import com.smartqueue.model.Token;
import com.smartqueue.model.TokenStatus;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TokenRepository extends JpaRepository<Token, Long> {
    List<Token> findByStatusOrderByGeneratedAtAsc(TokenStatus status);
    List<Token> findByCustomerIdOrderByGeneratedAtDesc(Long customerId);
    Optional<Token> findByTokenNumber(String tokenNumber);
    List<Token> findByServiceCounterIdAndStatus(Long counterId, TokenStatus status);
    List<Token> findByStatusInOrderByGeneratedAtAsc(List<TokenStatus> statuses);
    Long countByStatus(TokenStatus status);

    @Query("SELECT t FROM Token t WHERE t.completedAt BETWEEN :from AND :to")
    List<Token> findCompletedBetween(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);
}
