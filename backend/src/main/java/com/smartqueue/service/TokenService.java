package com.smartqueue.service;

import com.smartqueue.dto.TokenRequestDTO;
import com.smartqueue.dto.TokenResponseDTO;
import com.smartqueue.exception.TokenNotFoundException;
import com.smartqueue.factory.TokenCreator;
import com.smartqueue.model.CounterStatus;
import com.smartqueue.model.ServiceCounter;
import com.smartqueue.model.Token;
import com.smartqueue.model.TokenStatus;
import com.smartqueue.model.User;
import com.smartqueue.repository.CounterRepository;
import com.smartqueue.repository.TokenRepository;
import com.smartqueue.service.token.QueueOrderingService;
import com.smartqueue.service.token.TokenAccessService;
import com.smartqueue.service.token.TokenNumberGenerator;
import com.smartqueue.service.token.TokenResponseMapper;
import com.smartqueue.service.token.TokenStateTransitionPolicy;
import jakarta.transaction.Transactional;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

@Service
public class TokenService {

  private final TokenRepository tokenRepository;
  private final CounterRepository counterRepository;
  private final TokenCreator tokenCreator;
  private final QueueOrderingService queueOrderingService;
  private final NotificationService notificationService;
  private final TokenAccessService tokenAccessService;
  private final TokenStateTransitionPolicy tokenStateTransitionPolicy;
  private final TokenNumberGenerator tokenNumberGenerator;
  private final TokenResponseMapper tokenResponseMapper;

  public TokenService(
      TokenRepository tokenRepository,
      CounterRepository counterRepository,
      TokenCreator tokenCreator,
      QueueOrderingService queueOrderingService,
      NotificationService notificationService,
      TokenAccessService tokenAccessService,
      TokenStateTransitionPolicy tokenStateTransitionPolicy,
      TokenNumberGenerator tokenNumberGenerator,
      TokenResponseMapper tokenResponseMapper) {
    this.tokenRepository = tokenRepository;
    this.counterRepository = counterRepository;
    this.tokenCreator = tokenCreator;
    this.queueOrderingService = queueOrderingService;
    this.notificationService = notificationService;
    this.tokenAccessService = tokenAccessService;
    this.tokenStateTransitionPolicy = tokenStateTransitionPolicy;
    this.tokenNumberGenerator = tokenNumberGenerator;
    this.tokenResponseMapper = tokenResponseMapper;
  }

  @Transactional
  public TokenResponseDTO generateToken(TokenRequestDTO request, Long customerId) {
    User customer = tokenAccessService.getCustomer(customerId);

    Token token = tokenCreator.createToken(
        request.getTokenType(),
        request.getPriorityLevel());
    token.setCustomer(customer);
    token.setStatus(TokenStatus.WAITING);
    token.setServiceType(request.getServiceType());
    token.setGeneratedAt(LocalDateTime.now());
    token.setTokenNumber(tokenNumberGenerator.generate(request.getServiceType(), token));
    token.setWaitingPosition((int) (getQueueLength() + 1));
    notificationService.notifyStatusChanged(token);

    Token saved = tokenRepository.save(token);
    return tokenResponseMapper.toResponse(saved, buildWaitingPositionMap());
  }

  public List<TokenResponseDTO> getOrderedQueue() {
    List<Token> waiting = tokenRepository
        .findByStatusOrderByGeneratedAtAsc(TokenStatus.WAITING);

    Map<Long, Integer> waitingPositions = buildWaitingPositionMap(waiting);

    return queueOrderingService.orderTokens(waiting).stream()
        .map(token -> tokenResponseMapper.toResponse(token, waitingPositions))
        .collect(Collectors.toList());
  }

  public List<TokenResponseDTO> getTokensForCustomer(Long customerId) {
    Map<Long, Integer> waitingPositions = buildWaitingPositionMap();
    return tokenRepository
        .findByCustomerIdOrderByGeneratedAtDesc(customerId).stream()
        .map(token -> tokenResponseMapper.toResponse(token, waitingPositions))
        .collect(Collectors.toList());
  }

  public TokenResponseDTO getByTokenNumber(String tokenNumber, String requesterEmail) {
    Token token = tokenRepository.findByTokenNumber(tokenNumber)
        .orElseThrow(() -> new RuntimeException("Token not found: " + tokenNumber));

    tokenAccessService.ensureCanView(token, requesterEmail);

    return tokenResponseMapper.toResponse(token, buildWaitingPositionMap());
  }

  @Transactional
  public void deleteCustomerToken(Long tokenId, String requesterEmail) {
    Token token = tokenRepository.findById(tokenId)
        .orElseThrow(() -> new TokenNotFoundException(tokenId));

    tokenAccessService.ensureCanDelete(token, requesterEmail);

    clearCounterAssignmentIfNeeded(token);
    tokenRepository.delete(token);
  }

  @Transactional
  public TokenResponseDTO callNextToken(Long counterId) {
    ServiceCounter counter = counterRepository.findById(counterId)
        .orElseThrow(() -> new RuntimeException("Counter not found: " + counterId));

    if (!counter.isActive() || counter.getStatus() != CounterStatus.OPEN) {
      throw new IllegalStateException("This counter is not available to call tokens");
    }

    if (counter.getCurrentToken() != null
        && !Set.of(TokenStatus.COMPLETED, TokenStatus.SKIPPED).contains(counter.getCurrentToken().getStatus())) {
      throw new IllegalStateException("Finish or skip the current token before calling the next one");
    }

    List<Token> queue = getOrderedQueue().stream()
        .map(dto -> tokenRepository.findById(dto.getId()).orElseThrow())
        .collect(Collectors.toList());

    if (queue.isEmpty()) {
      throw new IllegalStateException("Queue is empty");
    }

    Token next = queue.get(0);
    next.setStatus(TokenStatus.CALLED);
    next.setCalledAt(LocalDateTime.now());
    next.setServiceCounter(counter);
    counter.setCurrentToken(next);

    tokenRepository.save(next);
    counterRepository.save(counter);
    notificationService.notifyTokenCalled(next);

    return tokenResponseMapper.toResponse(tokenRepository.save(next), buildWaitingPositionMap());
  }

  @Transactional
  public TokenResponseDTO updateTokenStatus(Long tokenId, TokenStatus newStatus) {
    Token token = tokenRepository.findById(tokenId)
        .orElseThrow(() -> new TokenNotFoundException(tokenId));

    tokenStateTransitionPolicy.validateTransition(token.getStatus(), newStatus);
    token.setStatus(newStatus);

    if (newStatus == TokenStatus.COMPLETED) {
      token.setCompletedAt(LocalDateTime.now());
    }

    if (newStatus == TokenStatus.SKIPPED || newStatus == TokenStatus.COMPLETED) {
      clearCounterAssignmentIfNeeded(token);
    }

    notificationService.notifyStatusChanged(token);
    return tokenResponseMapper.toResponse(tokenRepository.save(token), buildWaitingPositionMap());
  }

  private long getQueueLength() {
    return tokenRepository.countByStatus(TokenStatus.WAITING);
  }

  private void clearCounterAssignmentIfNeeded(Token token) {
    ServiceCounter counter = token.getServiceCounter();
    if (counter != null && counter.getCurrentToken() != null && counter.getCurrentToken().getId().equals(token.getId())) {
      counter.setCurrentToken(null);
      counterRepository.save(counter);
    }
  }

  private Map<Long, Integer> buildWaitingPositionMap() {
    return buildWaitingPositionMap(tokenRepository.findByStatusOrderByGeneratedAtAsc(TokenStatus.WAITING));
  }

  private Map<Long, Integer> buildWaitingPositionMap(List<Token> waitingTokens) {
    List<Token> ordered = queueOrderingService.orderTokens(waitingTokens);
    Map<Long, Integer> positions = new HashMap<>();
    for (int index = 0; index < ordered.size(); index++) {
      positions.put(ordered.get(index).getId(), index + 1);
    }
    return positions;
  }
}
