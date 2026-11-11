package com.caseflow.service;

import com.caseflow.dto.action.PendingActionDto;
import com.caseflow.entity.LegalCase;
import com.caseflow.entity.PendingAction;
import com.caseflow.entity.User;
import com.caseflow.entity.enums.ActionStatus;
import com.caseflow.entity.enums.PartyType;
import com.caseflow.exception.AccessDeniedOperationException;
import com.caseflow.exception.ResourceNotFoundException;
import com.caseflow.repository.PendingActionRepository;
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
public class PendingActionService {

    private final PendingActionRepository pendingActionRepository;
    private final LegalCaseService legalCaseService;
    private final SecurityContextService securityContextService;
    private final NotificationService notificationService;

    @Transactional(readOnly = true)
    public List<PendingActionDto> getAdvocatePendingActions() {
        User advocate = securityContextService.getCurrentAdvocate();
        return pendingActionRepository.findByAdvocateIdOrderByDueDateAsc(advocate.getId())
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PendingActionDto> getPendingActionsByCase(Long caseId) {
        LegalCase legalCase = legalCaseService.getAuthorizedCase(caseId);
        return pendingActionRepository.findByLegalCaseIdOrderByDueDateAsc(legalCase.getId())
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    @CacheEvict(value = {"advocateDashboard", "clientDashboard"}, allEntries = true)
    public PendingActionDto createPendingAction(PendingActionDto dto) {
        User advocate = securityContextService.getCurrentAdvocate();
        LegalCase legalCase = legalCaseService.getAuthorizedCase(dto.getCaseId());

        PendingAction action = PendingAction.builder()
                .legalCase(legalCase)
                .advocate(advocate)
                .title(dto.getTitle().trim())
                .responsibleParty(dto.getResponsibleParty().trim())
                .partyType(dto.getPartyType())
                .instructions(dto.getInstructions())
                .status(dto.getStatus() != null ? dto.getStatus() : ActionStatus.PENDING)
                .dueDate(dto.getDueDate())
                .resolutionNotes(dto.getResolutionNotes())
                .build();

        PendingAction saved = pendingActionRepository.save(action);

        if (saved.getPartyType() == PartyType.CLIENT && legalCase.getClient().getUserAccount() != null) {
            notificationService.createAndSendNotification(
                    legalCase.getClient().getUserAccount(),
                    legalCase,
                    "PENDING_ACTION",
                    "Action Required: " + saved.getTitle(),
                    saved.getInstructions() + " (Due: " + saved.getDueDate() + ")"
            );
        }

        return toDto(saved);
    }

    @Transactional
    @CacheEvict(value = {"advocateDashboard", "clientDashboard"}, allEntries = true)
    public PendingActionDto updatePendingAction(Long actionId, PendingActionDto dto) {
        User advocate = securityContextService.getCurrentAdvocate();
        PendingAction action = pendingActionRepository.findById(actionId)
                .orElseThrow(() -> new ResourceNotFoundException("Pending action not found"));
        if (!action.getAdvocate().getId().equals(advocate.getId())) {
            throw new AccessDeniedOperationException("Not authorized to update this pending action");
        }

        action.setTitle(dto.getTitle().trim());
        action.setResponsibleParty(dto.getResponsibleParty().trim());
        action.setPartyType(dto.getPartyType());
        action.setInstructions(dto.getInstructions());
        action.setStatus(dto.getStatus());
        action.setDueDate(dto.getDueDate());
        action.setResolutionNotes(dto.getResolutionNotes());

        if (dto.getStatus() == ActionStatus.COMPLETED && action.getCompletedAt() == null) {
            action.setCompletedAt(LocalDateTime.now());
        }

        return toDto(pendingActionRepository.save(action));
    }

    public PendingActionDto toDto(PendingAction a) {
        boolean overdue = a.getStatus() != ActionStatus.COMPLETED && a.getDueDate().isBefore(LocalDate.now());
        return PendingActionDto.builder()
                .id(a.getId())
                .caseId(a.getLegalCase().getId())
                .caseNumber(a.getLegalCase().getCaseNumber())
                .caseTitle(a.getLegalCase().getTitle())
                .clientName(a.getLegalCase().getClient().getFullName())
                .advocateId(a.getAdvocate().getId())
                .title(a.getTitle())
                .responsibleParty(a.getResponsibleParty())
                .partyType(a.getPartyType())
                .instructions(a.getInstructions())
                .status(overdue ? ActionStatus.OVERDUE : a.getStatus())
                .dueDate(a.getDueDate())
                .resolutionNotes(a.getResolutionNotes())
                .overdue(overdue)
                .completedAt(a.getCompletedAt())
                .createdAt(a.getCreatedAt())
                .updatedAt(a.getUpdatedAt())
                .build();
    }
}
