package com.smartqueue.service.token;

import com.smartqueue.model.Token;
import com.smartqueue.model.TokenStatus;
import com.smartqueue.model.User;
import com.smartqueue.model.UserRole;
import com.smartqueue.repository.UserRepository;
import java.util.Set;
import org.springframework.stereotype.Service;

@Service
public class TokenAccessService {

    private final UserRepository userRepository;

    public TokenAccessService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User getCustomer(Long customerId) {
        User customer = userRepository.findById(customerId)
            .orElseThrow(() -> new RuntimeException("Customer not found"));

        if (customer.getRole() != UserRole.CUSTOMER) {
            throw new IllegalStateException("Only customer accounts can generate tokens");
        }

        return customer;
    }

    public void ensureCanView(Token token, String requesterEmail) {
        User requester = getUserByEmail(requesterEmail);
        if (requester.getRole() == UserRole.CUSTOMER && !token.getCustomer().getId().equals(requester.getId())) {
            throw new IllegalStateException("You can only access your own tokens");
        }
    }

    public void ensureCanDelete(Token token, String requesterEmail) {
        User requester = getUserByEmail(requesterEmail);

        if (requester.getRole() != UserRole.CUSTOMER || !token.getCustomer().getId().equals(requester.getId())) {
            throw new IllegalStateException("You can only delete your own tokens");
        }

        if (!Set.of(TokenStatus.WAITING, TokenStatus.SKIPPED).contains(token.getStatus())) {
            throw new IllegalStateException("Only waiting or skipped tokens can be deleted");
        }
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found: " + email));
    }
}
