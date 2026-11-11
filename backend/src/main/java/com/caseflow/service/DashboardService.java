package com.caseflow.service;

import com.caseflow.dto.action.PendingActionDto;
import com.caseflow.dto.casefile.CaseUpdateDto;
import com.caseflow.dto.casefile.LegalCaseDto;
import com.caseflow.dto.dashboard.AdvocateDashboardDto;
import com.caseflow.dto.dashboard.ClientDashboardDto;
import com.caseflow.dto.document.DocumentDto;
import com.caseflow.dto.hearing.HearingDto;
import com.caseflow.dto.request.ClientRequestDto;
import com.caseflow.dto.task.TaskDto;
import com.caseflow.entity.Client;
import com.caseflow.entity.User;
import com.caseflow.entity.enums.*;
import com.caseflow.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final LegalCaseRepository legalCaseRepository;
    private final ClientRepository clientRepository;
    private final HearingRepository hearingRepository;
    private final TaskRepository taskRepository;
    private final DocumentRepository documentRepository;
    private final PendingActionRepository pendingActionRepository;
    private final ClientRequestRepository clientRequestRepository;
    private final CaseUpdateRepository caseUpdateRepository;
    private final NotificationRepository notificationRepository;

    private final LegalCaseService legalCaseService;
    private final HearingService hearingService;
    private final TaskService taskService;
    private final DocumentService documentService;
    private final PendingActionService pendingActionService;
    private final ClientRequestService clientRequestService;

    @Transactional(readOnly = true)
    public AdvocateDashboardDto getAdvocateDashboard(User advocate) {
        Long advocateId = advocate.getId();

        long totalCases = legalCaseRepository.countByAdvocateId(advocateId);
        long activeCases = legalCaseRepository.countByAdvocateIdAndStatusNotIn(
                advocateId, List.of(CaseStatus.CLOSED, CaseStatus.DISPOSED));
        long totalClients = clientRepository.countByAdvocateId(advocateId);

        List<HearingDto> upcomingHearings = hearingRepository
                .findByLegalCaseAdvocateIdAndHearingDateGreaterThanEqualAndStatusOrderByHearingDateAsc(
                        advocateId, LocalDateTime.now().minusHours(2), HearingStatus.SCHEDULED)
                .stream()
                .map(hearingService::toDto)
                .collect(Collectors.toList());

        List<TaskDto> allPendingTasks = taskRepository
                .findByAssignedAdvocateIdAndStatusNotOrderByDueDateAsc(advocateId, TaskStatus.COMPLETED)
                .stream()
                .map(taskService::toDto)
                .collect(Collectors.toList());

        long urgentTasksCount = allPendingTasks.stream()
                .filter(t -> t.getPriority() == PriorityLevel.URGENT || t.getPriority() == PriorityLevel.HIGH)
                .count();

        long overdueTasksCount = allPendingTasks.stream()
                .filter(TaskDto::isOverdue)
                .count();

        List<TaskDto> urgentAndOverdueTasks = allPendingTasks.stream()
                .filter(t -> t.isOverdue() || t.getPriority() == PriorityLevel.URGENT || t.getPriority() == PriorityLevel.HIGH)
                .limit(8)
                .collect(Collectors.toList());

        List<DocumentDto> missingDocs = documentRepository
                .findByLegalCaseAdvocateIdAndStatusOrderByUpdatedAtDesc(advocateId, DocumentStatus.REQUIRED)
                .stream()
                .map(documentService::toDto)
                .collect(Collectors.toList());

        List<DocumentDto> awaitingVerifDocs = documentRepository
                .findByLegalCaseAdvocateIdAndStatusOrderByUpdatedAtDesc(advocateId, DocumentStatus.AWAITING_VERIFICATION)
                .stream()
                .map(documentService::toDto)
                .collect(Collectors.toList());

        List<DocumentDto> docsNeedingAttention = awaitingVerifDocs.stream().collect(Collectors.toList());
        docsNeedingAttention.addAll(missingDocs);

        List<PendingActionDto> pendingActions = pendingActionRepository
                .findByAdvocateIdAndStatusNotOrderByDueDateAsc(advocateId, ActionStatus.COMPLETED)
                .stream()
                .map(pendingActionService::toDto)
                .collect(Collectors.toList());

        List<ClientRequestDto> followUps = clientRequestRepository
                .findByAdvocateIdAndStatusInOrderByDueDateAsc(
                        advocateId,
                        List.of(ClientRequestStatus.PENDING_CLIENT, ClientRequestStatus.SUBMITTED_BY_CLIENT, ClientRequestStatus.NEEDS_REVISION))
                .stream()
                .map(clientRequestService::toDto)
                .collect(Collectors.toList());

        List<LegalCaseDto> upcomingDeadlines = legalCaseRepository
                .findByAdvocateIdAndNextDeadlineBetweenOrderByNextDeadlineAsc(
                        advocateId, LocalDate.now().minusDays(7), LocalDate.now().plusDays(30))
                .stream()
                .map(legalCaseService::toDto)
                .collect(Collectors.toList());

        List<CaseUpdateDto> recentUpdates = caseUpdateRepository
                .findTop10ByLegalCaseAdvocateIdOrderByCreatedAtDesc(advocateId)
                .stream()
                .map(legalCaseService::toUpdateDto)
                .collect(Collectors.toList());

        return AdvocateDashboardDto.builder()
                .totalCases(totalCases)
                .activeCases(activeCases)
                .totalClients(totalClients)
                .upcomingHearingsCount(upcomingHearings.size())
                .urgentTasksCount(urgentTasksCount)
                .overdueTasksCount(overdueTasksCount)
                .missingDocumentsCount(missingDocs.size())
                .awaitingVerificationDocumentsCount(awaitingVerifDocs.size())
                .pendingActionsCount(pendingActions.size())
                .requiredClientFollowUpsCount(followUps.size())
                .upcomingDeadlinesCount(upcomingDeadlines.size())
                .upcomingHearings(upcomingHearings.stream().limit(6).collect(Collectors.toList()))
                .urgentAndOverdueTasks(urgentAndOverdueTasks)
                .documentsNeedingAttention(docsNeedingAttention.stream().limit(8).collect(Collectors.toList()))
                .pendingActions(pendingActions.stream().limit(6).collect(Collectors.toList()))
                .clientFollowUps(followUps.stream().limit(6).collect(Collectors.toList()))
                .upcomingDeadlines(upcomingDeadlines.stream().limit(6).collect(Collectors.toList()))
                .recentCaseUpdates(recentUpdates)
                .build();
    }

    @Transactional(readOnly = true)
    public ClientDashboardDto getClientDashboard(Client client) {
        Long clientId = client.getId();

        List<LegalCaseDto> assignedCases = legalCaseRepository.findByClientIdOrderByUpdatedAtDesc(clientId)
                .stream()
                .map(legalCaseService::toDto)
                .collect(Collectors.toList());

        List<HearingDto> upcomingHearings = hearingRepository.findByLegalCaseClientIdOrderByHearingDateAsc(clientId)
                .stream()
                .filter(h -> h.getStatus() == HearingStatus.SCHEDULED && h.getHearingDate().isAfter(LocalDateTime.now().minusHours(2)))
                .map(hearingService::toDto)
                .collect(Collectors.toList());

        List<DocumentDto> allClientDocs = documentRepository.findByLegalCaseClientIdOrderByUpdatedAtDesc(clientId)
                .stream()
                .map(documentService::toDto)
                .collect(Collectors.toList());

        long requiredDocsCount = allClientDocs.stream()
                .filter(d -> d.getStatus() == DocumentStatus.REQUIRED || d.getStatus() == DocumentStatus.REJECTED)
                .count();

        long awaitingVerifCount = allClientDocs.stream()
                .filter(d -> d.getStatus() == DocumentStatus.AWAITING_VERIFICATION)
                .count();

        List<ClientRequestDto> allRequests = clientRequestRepository.findByClientIdOrderByCreatedAtDesc(clientId)
                .stream()
                .map(clientRequestService::toDto)
                .collect(Collectors.toList());

        long pendingRequestsCount = allRequests.stream()
                .filter(r -> r.getStatus() == ClientRequestStatus.PENDING_CLIENT || r.getStatus() == ClientRequestStatus.NEEDS_REVISION)
                .count();

        List<CaseUpdateDto> recentUpdates = caseUpdateRepository
                .findByLegalCaseClientIdAndVisibleToClientTrueOrderByCreatedAtDesc(clientId)
                .stream()
                .limit(10)
                .map(legalCaseService::toUpdateDto)
                .collect(Collectors.toList());

        long unreadCount = client.getUserAccount() != null
                ? notificationRepository.countByRecipientIdAndReadFalse(client.getUserAccount().getId())
                : 0;

        return ClientDashboardDto.builder()
                .clientName(client.getFullName())
                .advocateName(client.getAdvocate().getFullName())
                .advocateEmail(client.getAdvocate().getEmail())
                .advocatePhone(client.getAdvocate().getPhone())
                .assignedCasesCount(assignedCases.size())
                .upcomingHearingsCount(upcomingHearings.size())
                .requiredDocumentsCount(requiredDocsCount)
                .awaitingVerificationCount(awaitingVerifCount)
                .pendingRequestsCount(pendingRequestsCount)
                .unreadNotificationsCount(unreadCount)
                .assignedCases(assignedCases)
                .upcomingHearings(upcomingHearings)
                .requiredAndSubmittedDocuments(allClientDocs)
                .pendingRequests(allRequests)
                .recentCaseUpdates(recentUpdates)
                .build();
    }
}
