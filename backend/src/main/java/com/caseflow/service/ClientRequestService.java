package com.caseflow.service;

import com.caseflow.dto.request.ClientRequestDto;
import com.caseflow.entity.Client;
import com.caseflow.entity.ClientRequest;
import com.caseflow.entity.LegalCase;
import com.caseflow.entity.User;
import com.caseflow.entity.enums.ClientRequestStatus;
import com.caseflow.exception.AccessDeniedOperationException;
import com.caseflow.exception.BadRequestException;
import com.caseflow.exception.ResourceNotFoundException;
import com.caseflow.repository.ClientRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClientRequestService {

    private final ClientRequestRepository clientRequestRepository;
    private final LegalCaseService legalCaseService;
    private final SecurityContextService securityContextService;
    private final NotificationService notificationService;

    @Transactional(readOnly = true)
    public List<ClientRequestDto> getAdvocateRequests() {
        User advocate = securityContextService.getCurrentAdvocate();
        return clientRequestRepository.findByAdvocateIdOrderByCreatedAtDesc(advocate.getId())
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ClientRequestDto> getClientRequests() {
        Client client = securityContextService.getCurrentClientProfile();
        return clientRequestRepository.findByClientIdOrderByCreatedAtDesc(client.getId())
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    @CacheEvict(value = {"advocateDashboard", "clientDashboard"}, allEntries = true)
    public ClientRequestDto createClientRequest(ClientRequestDto dto) {
        User advocate = securityContextService.getCurrentAdvocate();
        LegalCase legalCase = legalCaseService.getAuthorizedCase(dto.getCaseId());

        ClientRequest request = ClientRequest.builder()
                .legalCase(legalCase)
                .client(legalCase.getClient())
                .advocate(advocate)
                .title(dto.getTitle().trim())
                .requestType(dto.getRequestType())
                .instructions(dto.getInstructions())
                .status(ClientRequestStatus.PENDING_CLIENT)
                .dueDate(dto.getDueDate())
                .build();

        ClientRequest saved = clientRequestRepository.save(request);

        if (legalCase.getClient().getUserAccount() != null) {
            notificationService.createAndSendNotification(
                    legalCase.getClient().getUserAccount(),
                    legalCase,
                    "CLIENT_REQUEST",
                    "New Request from Advocate: " + saved.getTitle(),
                    saved.getInstructions() + " (Due: " + saved.getDueDate() + ")"
            );
        }

        return toDto(saved);
    }

    @Transactional
    @CacheEvict(value = {"advocateDashboard", "clientDashboard"}, allEntries = true)
    public ClientRequestDto submitClientResponse(Long requestId, String responseText) {
        if (responseText == null || responseText.trim().isEmpty()) {
            throw new BadRequestException("Response text cannot be empty");
        }
        Client client = securityContextService.getCurrentClientProfile();
        ClientRequest request = clientRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Client request not found"));
        if (!request.getClient().getId().equals(client.getId())) {
            throw new AccessDeniedOperationException("You cannot respond to another client's request");
        }

        request.setClientResponse(responseText.trim());
        request.setStatus(ClientRequestStatus.SUBMITTED_BY_CLIENT);
        request.setRespondedAt(LocalDateTime.now());

        ClientRequest saved = clientRequestRepository.save(request);

        notificationService.createAndSendNotification(
                request.getAdvocate(),
                request.getLegalCase(),
                "CLIENT_RESPONSE",
                "Client Responded: " + saved.getTitle(),
                "Client " + client.getFullName() + " submitted a response for request '" + saved.getTitle() + "'."
        );

        return toDto(saved);
    }

    @Transactional
    @CacheEvict(value = {"advocateDashboard", "clientDashboard"}, allEntries = true)
    public ClientRequestDto reviewClientResponse(Long requestId, ClientRequestStatus status, String reviewNotes) {
        User advocate = securityContextService.getCurrentAdvocate();
        ClientRequest request = clientRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Client request not found"));
        if (!request.getAdvocate().getId().equals(advocate.getId())) {
            throw new AccessDeniedOperationException("Not authorized to review this request");
        }

        request.setStatus(status);
        request.setAdvocateReviewNotes(reviewNotes);
        request.setReviewedAt(LocalDateTime.now());

        ClientRequest saved = clientRequestRepository.save(request);

        if (request.getClient().getUserAccount() != null) {
            notificationService.createAndSendNotification(
                    request.getClient().getUserAccount(),
                    request.getLegalCase(),
                    "REQUEST_REVIEWED",
                    "Request Reviewed (" + status + "): " + saved.getTitle(),
                    reviewNotes != null ? reviewNotes : "Your response has been reviewed by your advocate."
            );
        }

        return toDto(saved);
    }

    public ClientRequestDto toDto(ClientRequest r) {
        boolean overdue = (r.getStatus() == ClientRequestStatus.PENDING_CLIENT || r.getStatus() == ClientRequestStatus.NEEDS_REVISION)
                && r.getDueDate().isBefore(LocalDate.now());
        return ClientRequestDto.builder()
                .id(r.getId())
                .caseId(r.getLegalCase().getId())
                .caseNumber(r.getLegalCase().getCaseNumber())
                .caseTitle(r.getLegalCase().getTitle())
                .clientId(r.getClient().getId())
                .clientName(r.getClient().getFullName())
                .advocateId(r.getAdvocate().getId())
                .advocateName(r.getAdvocate().getFullName())
                .title(r.getTitle())
                .requestType(r.getRequestType())
                .instructions(r.getInstructions())
                .clientResponse(r.getClientResponse())
                .advocateReviewNotes(r.getAdvocateReviewNotes())
                .status(r.getStatus())
                .dueDate(r.getDueDate())
                .overdue(overdue)
                .respondedAt(r.getRespondedAt())
                .reviewedAt(r.getReviewedAt())
                .createdAt(r.getCreatedAt())
                .updatedAt(r.getUpdatedAt())
                .build();
    }
}
