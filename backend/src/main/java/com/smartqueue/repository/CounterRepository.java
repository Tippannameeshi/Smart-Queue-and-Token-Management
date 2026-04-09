package com.smartqueue.repository;

import com.smartqueue.model.ServiceCounter;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CounterRepository extends JpaRepository<ServiceCounter, Long> {
    List<ServiceCounter> findByIsActiveTrue();
    Optional<ServiceCounter> findByCounterNumber(int number);
}
