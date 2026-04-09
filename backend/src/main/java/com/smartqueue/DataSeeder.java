package com.smartqueue;

import com.smartqueue.model.CounterStatus;
import com.smartqueue.model.ServiceCounter;
import com.smartqueue.model.User;
import com.smartqueue.model.UserRole;
import com.smartqueue.repository.CounterRepository;
import com.smartqueue.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private CounterRepository counterRepo;

    @Autowired
    private BCryptPasswordEncoder encoder;

    @Override
    public void run(String... args) {
        if (userRepo.count() == 0) {
            userRepo.save(buildUser("Admin User", "admin@sq.com", "admin123", "9999999990", UserRole.ADMIN));
            userRepo.save(buildUser("Operator One", "op1@sq.com", "op123", "9999999991", UserRole.OPERATOR));
            userRepo.save(buildUser("Manager One", "mgr@sq.com", "mgr123", "9999999992", UserRole.MANAGER));
            userRepo.save(buildUser("Test Customer", "customer@sq.com", "cust123", "9999999993", UserRole.CUSTOMER));

            for (int i = 1; i <= 3; i++) {
                ServiceCounter counter = new ServiceCounter();
                counter.setCounterNumber(i);
                counter.setCounterName("Counter " + (char) ('A' + i - 1));
                counter.setActive(true);
                counter.setStatus(CounterStatus.OPEN);
                counterRepo.save(counter);
            }

            System.out.println("Seed data inserted successfully.");
        } else {
            System.out.println("Seed data already exists, skipping.");
        }
    }

    private User buildUser(String name, String email, String rawPassword, String phone, UserRole role) {
        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPassword(encoder.encode(rawPassword));
        user.setPhone(phone);
        user.setRole(role);
        return user;
    }
}
