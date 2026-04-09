package com.smartqueue.controller;

import com.smartqueue.dto.CounterRequestDTO;
import com.smartqueue.dto.CounterResponseDTO;
import com.smartqueue.service.CounterService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/counters")
@CrossOrigin(origins = "http://localhost:5173")
public class CounterController {

    @Autowired
    private CounterService counterService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<CounterResponseDTO>> getAllCounters() {
        return ResponseEntity.ok(counterService.getAllCounters());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CounterResponseDTO> createCounter(@Valid @RequestBody CounterRequestDTO request) {
        return ResponseEntity.ok(counterService.createCounter(request));
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CounterResponseDTO> updateCounter(@PathVariable Long id, @Valid @RequestBody CounterRequestDTO request) {
        return ResponseEntity.ok(counterService.updateCounter(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteCounter(@PathVariable Long id) {
        counterService.deleteCounter(id);
        return ResponseEntity.noContent().build();
    }
}
