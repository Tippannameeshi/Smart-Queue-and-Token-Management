package com.smartqueue.controller;

import com.smartqueue.dto.QueueStatsDTO;
import com.smartqueue.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "http://localhost:5173")
public class ReportController {

    @Autowired
    private ReportService reportService;

    @GetMapping("/queue-stats")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<QueueStatsDTO> getQueueStats() {
        return ResponseEntity.ok(reportService.getQueueStats());
    }
}
