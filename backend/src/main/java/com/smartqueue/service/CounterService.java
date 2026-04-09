package com.smartqueue.service;

import com.smartqueue.dto.CounterRequestDTO;
import com.smartqueue.dto.CounterResponseDTO;
import com.smartqueue.dto.CounterTokenSummaryDTO;
import com.smartqueue.model.ServiceCounter;
import com.smartqueue.model.Token;
import com.smartqueue.repository.CounterRepository;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import static org.springframework.http.HttpStatus.CONFLICT;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class CounterService {

    @Autowired
    private CounterRepository counterRepository;

    public List<CounterResponseDTO> getAllCounters() {
        return counterRepository.findAll().stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }

    @Transactional
    public CounterResponseDTO createCounter(CounterRequestDTO request) {
        ensureCounterNumberAvailable(request.getCounterNumber(), null);

        ServiceCounter counter = new ServiceCounter();
        counter.setCounterName(request.getCounterName().trim());
        counter.setCounterNumber(request.getCounterNumber());
        counter.setActive(request.isActive());
        counter.setStatus(request.getStatus());

        return toResponse(counterRepository.save(counter));
    }

    @Transactional
    public CounterResponseDTO updateCounter(Long counterId, CounterRequestDTO request) {
        ServiceCounter counter = counterRepository.findById(counterId)
            .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Counter not found"));

        ensureCounterNumberAvailable(request.getCounterNumber(), counterId);
        counter.setCounterName(request.getCounterName().trim());
        counter.setCounterNumber(request.getCounterNumber());
        counter.setActive(request.isActive());
        counter.setStatus(request.getStatus());

        return toResponse(counterRepository.save(counter));
    }

    @Transactional
    public void deleteCounter(Long counterId) {
        ServiceCounter counter = counterRepository.findById(counterId)
            .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Counter not found"));
        if (counter.getCurrentToken() != null) {
            throw new ResponseStatusException(CONFLICT, "Cannot delete a counter with an active token assignment");
        }
        counterRepository.delete(counter);
    }

    private void ensureCounterNumberAvailable(int counterNumber, Long currentCounterId) {
        counterRepository.findByCounterNumber(counterNumber).ifPresent(existing -> {
            if (currentCounterId == null || !existing.getId().equals(currentCounterId)) {
                throw new ResponseStatusException(CONFLICT, "A counter with this number already exists");
            }
        });
    }

    private CounterResponseDTO toResponse(ServiceCounter counter) {
        return new CounterResponseDTO(
            counter.getId(),
            counter.getCounterName(),
            counter.getCounterNumber(),
            counter.isActive(),
            counter.getStatus(),
            toCurrentTokenSummary(counter.getCurrentToken())
        );
    }

    private CounterTokenSummaryDTO toCurrentTokenSummary(Token token) {
        if (token == null) {
            return null;
        }

        String priorityLevel = token instanceof com.smartqueue.model.PriorityToken priorityToken
            ? priorityToken.getPriorityLevel().name()
            : "REGULAR";

        return new CounterTokenSummaryDTO(
            token.getId(),
            token.getTokenNumber(),
            token.getStatus().name(),
            token.getServiceType(),
            priorityLevel
        );
    }
}
