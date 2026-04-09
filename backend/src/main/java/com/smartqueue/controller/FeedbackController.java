package com.smartqueue.controller;

import com.smartqueue.dto.FeedbackRequestDTO;
import com.smartqueue.service.FeedbackService;
import jakarta.validation.Valid;
import java.security.Principal;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/feedback")
public class FeedbackController {

    private final FeedbackService feedbackService;

    public FeedbackController(FeedbackService feedbackService) {
        this.feedbackService = feedbackService;
    }

    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<Map<String, String>> submitFeedback(@Valid @RequestBody FeedbackRequestDTO request, Principal principal) {
        feedbackService.submitFeedback(principal.getName(), request);
        return ResponseEntity.ok(Map.of("message", "Feedback submitted successfully"));
    }
}
