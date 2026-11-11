package com.caseflow.service;

import com.caseflow.dto.casefile.CaseUpdateDto;
import com.caseflow.dto.casefile.LegalCaseDto;
import com.caseflow.entity.*;
import com.caseflow.entity.enums.*;
import com.caseflow.exception.AccessDeniedOperationException;
import com.caseflow.exception.BadRequestException;
import com.caseflow.exception.ResourceNotFoundException;
import com.caseflow.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LegalCaseService {

    private final LegalCaseRepository legalCaseRepository;
    private final ClientRepository clientRepository;
    private final HearingRepository hearingRepository;
    private final TaskRepository taskRepository;
    private final DocumentRepository documentRepository;
    private final PendingActionRepository pendingActionRepository;
    private final CaseUpdateRepository caseUpdateRepository;
    private final SecurityContextService securityContextService;
    private final NotificationService notificationService;

    @Transactional(readOnly = true)
    public List<LegalCaseDto> getAdvocateCases() {
        User advocate = securityContextService.getCurrentAdvocate();
        return legalCaseRepository.findByAdvocateIdOrderByUpdatedAtDesc(advocate.getId())
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<LegalCaseDto> getClientCases() {
        Client client = securityContextService.getCurrentClientProfile();
        return legalCaseRepository.findByClientIdOrderByUpdatedAtDesc(client.getId())
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public LegalCaseDto getCaseById(Long caseId) {
        LegalCase legalCase = getAuthorizedCase(caseId);
        return toDto(legalCase);
    }

    @Transactional
    @CacheEvict(value = {"advocateDashboard", "clientDashboard"}, allEntries = true)
    public LegalCaseDto createCase(LegalCaseDto dto) {
        User advocate = securityContextService.getCurrentAdvocate();
        if (legalCaseRepository.existsByCaseNumberIgnoreCase(dto.getCaseNumber().trim())) {
            throw new BadRequestException("Case number already exists: " + dto.getCaseNumber());
        }

        Client client = clientRepository.findById(dto.getClientId())
                .orElseThrow(() -> new ResourceNotFoundException("Client not found"));
        if (!client.getAdvocate().getId().equals(advocate.getId())) {
            throw new AccessDeniedOperationException("Client does not belong to your practice");
        }

        LegalCase legalCase = LegalCase.builder()
                .caseNumber(dto.getCaseNumber().trim().toUpperCase())
                .title(dto.getTitle().trim())
                .caseType(dto.getCaseType())
                .status(dto.getStatus())
                .priority(dto.getPriority())
                .courtName(dto.getCourtName())
                .courtHall(dto.getCourtHall())
                .judgeName(dto.getJudgeName())
                .opposingParty(dto.getOpposingParty())
                .opposingCounsel(dto.getOpposingCounsel())
                .description(dto.getDescription())
                .filingDate(dto.getFilingDate())
                .nextDeadline(dto.getNextDeadline())
                .deadlineDescription(dto.getDeadlineDescription())
                .advocate(advocate)
                .client(client)
                .build();

        LegalCase saved = legalCaseRepository.save(legalCase);

        recordCaseUpdateInternal(saved, advocate, "CASE_CREATED",
                "Case Registered: " + saved.getCaseNumber(),
                "Case '" + saved.getTitle() + "' has been registered before " + saved.getCourtName() + ".",
                true);

        if (client.getUserAccount() != null) {
            notificationService.createAndSendNotification(
                    client.getUserAccount(),
                    saved,
                    "CASE_UPDATE",
                    "New Case Registered: " + saved.getCaseNumber(),
                    "Your advocate " + advocate.getFullName() + " has registered case '" + saved.getTitle() + "'."
            );
        }

        return toDto(saved);
    }

    @Transactional
    @CacheEvict(value = {"advocateDashboard", "clientDashboard"}, allEntries = true)
    public LegalCaseDto updateCase(Long caseId, LegalCaseDto dto) {
        User advocate = securityContextService.getCurrentAdvocate();
        LegalCase legalCase = legalCaseRepository.findById(caseId)
                .orElseThrow(() -> new ResourceNotFoundException("Case not found"));
        if (!legalCase.getAdvocate().getId().equals(advocate.getId())) {
            throw new AccessDeniedOperationException("Not authorized to update this case");
        }

        Client client = clientRepository.findById(dto.getClientId())
                .orElseThrow(() -> new ResourceNotFoundException("Client not found"));

        CaseStatus oldStatus = legalCase.getStatus();
        legalCase.setTitle(dto.getTitle().trim());
        legalCase.setCaseType(dto.getCaseType());
        legalCase.setStatus(dto.getStatus());
        legalCase.setPriority(dto.getPriority());
        legalCase.setCourtName(dto.getCourtName());
        legalCase.setCourtHall(dto.getCourtHall());
        legalCase.setJudgeName(dto.getJudgeName());
        legalCase.setOpposingParty(dto.getOpposingParty());
        legalCase.setOpposingCounsel(dto.getOpposingCounsel());
        legalCase.setDescription(dto.getDescription());
        legalCase.setFilingDate(dto.getFilingDate());
        legalCase.setNextDeadline(dto.getNextDeadline());
        legalCase.setDeadlineDescription(dto.getDeadlineDescription());
        legalCase.setClient(client);

        LegalCase saved = legalCaseRepository.save(legalCase);

        String details = oldStatus != saved.getStatus()
                ? "Case status updated from " + oldStatus + " to " + saved.getStatus() + "."
                : "Case particulars and deadline details updated.";

        recordCaseUpdateInternal(saved, advocate, "CASE_UPDATED",
                "Case Updated: " + saved.getCaseNumber(), details, true);

        if (client.getUserAccount() != null) {
            notificationService.createAndSendNotification(
                    client.getUserAccount(),
                    saved,
                    "CASE_UPDATE",
                    "Case Update: " + saved.getCaseNumber(),
                    details
            );
        }

        return toDto(saved);
    }

    @Transactional
    @CacheEvict(value = {"advocateDashboard", "clientDashboard"}, allEntries = true)
    public CaseUpdateDto addCaseUpdate(CaseUpdateDto dto) {
        User advocate = securityContextService.getCurrentAdvocate();
        LegalCase legalCase = legalCaseRepository.findById(dto.getCaseId())
                .orElseThrow(() -> new ResourceNotFoundException("Case not found"));
        if (!legalCase.getAdvocate().getId().equals(advocate.getId())) {
            throw new AccessDeniedOperationException("Not authorized to update this case");
        }

        CaseUpdate saved = recordCaseUpdateInternal(
                legalCase, advocate, dto.getUpdateType(), dto.getTitle(), dto.getDetails(), dto.isVisibleToClient());

        if (dto.isVisibleToClient() && legalCase.getClient().getUserAccount() != null) {
            notificationService.createAndSendNotification(
                    legalCase.getClient().getUserAccount(),
                    legalCase,
                    "CASE_UPDATE",
                    dto.getTitle(),
                    dto.getDetails()
            );
        }
        return toUpdateDto(saved);
    }

    @Transactional(readOnly = true)
    public List<CaseUpdateDto> getCaseUpdates(Long caseId) {
        LegalCase legalCase = getAuthorizedCase(caseId);
        User currentUser = securityContextService.getCurrentUser();
        return caseUpdateRepository.findByLegalCaseIdOrderByCreatedAtDesc(legalCase.getId())
                .stream()
                .filter(u -> currentUser.getRole() == Role.ADVOCATE || u.isVisibleToClient())
                .map(this::toUpdateDto)
                .collect(Collectors.toList());
    }

    public CaseUpdate recordCaseUpdateInternal(LegalCase legalCase, User author, String type, String title, String details, boolean visibleToClient) {
        CaseUpdate update = CaseUpdate.builder()
                .legalCase(legalCase)
                .author(author)
                .updateType(type)
                .title(title)
                .details(details)
                .visibleToClient(visibleToClient)
                .build();
        return caseUpdateRepository.save(update);
    }

    public LegalCase getAuthorizedCase(Long caseId) {
        User user = securityContextService.getCurrentUser();
        LegalCase legalCase = legalCaseRepository.findById(caseId)
                .orElseThrow(() -> new ResourceNotFoundException("Case not found"));

        if (user.getRole() == Role.ADVOCATE) {
            if (!legalCase.getAdvocate().getId().equals(user.getId())) {
                throw new AccessDeniedOperationException("You do not have access to this case");
            }
        } else {
            Client client = securityContextService.getCurrentClientProfile();
            if (!legalCase.getClient().getId().equals(client.getId())) {
                throw new AccessDeniedOperationException("You do not have access to this case");
            }
        }
        return legalCase;
    }

    public LegalCaseDto toDto(LegalCase c) {
        LocalDateTime nextHearing = hearingRepository.findByLegalCaseIdOrderByHearingDateDesc(c.getId())
                .stream()
                .filter(h -> h.getStatus() == HearingStatus.SCHEDULED && h.getHearingDate().isAfter(LocalDateTime.now()))
                .map(Hearing::getHearingDate)
                .min(LocalDateTime::compareTo)
                .orElse(null);

        int pendingTasks = (int) taskRepository.findByLegalCaseIdOrderByDueDateAsc(c.getId())
                .stream()
                .filter(t -> t.getStatus() != TaskStatus.COMPLETED)
                .count();

        int missingDocs = (int) documentRepository.findByLegalCaseIdOrderByUpdatedAtDesc(c.getId())
                .stream()
                .filter(d -> d.getStatus() == DocumentStatus.REQUIRED || d.getStatus() == DocumentStatus.REJECTED)
                .count();

        int pendingActions = (int) pendingActionRepository.findByLegalCaseIdOrderByDueDateAsc(c.getId())
                .stream()
                .filter(a -> a.getStatus() != ActionStatus.COMPLETED)
                .count();

        return LegalCaseDto.builder()
                .id(c.getId())
                .caseNumber(c.getCaseNumber())
                .title(c.getTitle())
                .caseType(c.getCaseType())
                .status(c.getStatus())
                .priority(c.getPriority())
                .courtName(c.getCourtName())
                .courtHall(c.getCourtHall())
                .judgeName(c.getJudgeName())
                .opposingParty(c.getOpposingParty())
                .opposingCounsel(c.getOpposingCounsel())
                .description(c.getDescription())
                .filingDate(c.getFilingDate())
                .nextDeadline(c.getNextDeadline())
                .deadlineDescription(c.getDeadlineDescription())
                .advocateId(c.getAdvocate().getId())
                .advocateName(c.getAdvocate().getFullName())
                .clientId(c.getClient().getId())
                .clientName(c.getClient().getFullName())
                .clientEmail(c.getClient().getEmail())
                .clientPhone(c.getClient().getPhone())
                .nextHearingDate(nextHearing)
                .pendingTasksCount(pendingTasks)
                .missingDocumentsCount(missingDocs)
                .pendingActionsCount(pendingActions)
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
                .build();
    }

    public CaseUpdateDto toUpdateDto(CaseUpdate u) {
        return CaseUpdateDto.builder()
                .id(u.getId())
                .caseId(u.getLegalCase().getId())
                .caseNumber(u.getLegalCase().getCaseNumber())
                .caseTitle(u.getLegalCase().getTitle())
                .authorUserId(u.getAuthor().getId())
                .authorName(u.getAuthor().getFullName())
                .updateType(u.getUpdateType())
                .title(u.getTitle())
                .details(u.getDetails())
                .visibleToClient(u.isVisibleToClient())
                .createdAt(u.getCreatedAt())
                .build();
    }
}
