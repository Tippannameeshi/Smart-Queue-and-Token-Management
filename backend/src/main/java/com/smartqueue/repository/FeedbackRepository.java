package com.smartqueue.repository;

import com.smartqueue.model.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    boolean existsByTokenId(Long tokenId);
}
