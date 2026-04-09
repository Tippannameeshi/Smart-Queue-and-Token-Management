package com.smartqueue.service;

import com.smartqueue.dto.FeedbackRequestDTO;
import com.smartqueue.model.Feedback;
import com.smartqueue.model.Token;
import com.smartqueue.model.TokenStatus;
import com.smartqueue.model.User;
import com.smartqueue.repository.FeedbackRepository;
import com.smartqueue.repository.TokenRepository;
import com.smartqueue.repository.UserRepository;
import java.time.LocalDateTime;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.FORBIDDEN;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final TokenRepository tokenRepository;
    private final UserRepository userRepository;

    public FeedbackService(FeedbackRepository feedbackRepository, TokenRepository tokenRepository, UserRepository userRepository) {
        this.feedbackRepository = feedbackRepository;
        this.tokenRepository = tokenRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public void submitFeedback(String customerEmail, FeedbackRequestDTO request) {
        User customer = userRepository.findByEmail(customerEmail)
            .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Customer not found"));

        Token token = tokenRepository.findById(request.getTokenId())
            .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Token not found"));

        if (!token.getCustomer().getId().equals(customer.getId())) {
            throw new ResponseStatusException(FORBIDDEN, "You can only submit feedback for your own tokens");
        }

        if (token.getStatus() != TokenStatus.COMPLETED) {
            throw new ResponseStatusException(BAD_REQUEST, "Feedback can only be submitted after service completion");
        }

        if (feedbackRepository.existsByTokenId(token.getId())) {
            throw new ResponseStatusException(BAD_REQUEST, "Feedback has already been submitted for this token");
        }

        Feedback feedback = new Feedback();
        feedback.setCustomer(customer);
        feedback.setToken(token);
        feedback.setRating(request.getRating());
        feedback.setComment(request.getComment().trim());
        feedback.setSubmittedAt(LocalDateTime.now());
        feedbackRepository.save(feedback);
    }
}
