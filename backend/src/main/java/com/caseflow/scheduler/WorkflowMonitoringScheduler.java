package com.caseflow.scheduler;

import com.caseflow.entity.*;
import com.caseflow.entity.enums.ActionStatus;
import com.caseflow.entity.enums.ClientRequestStatus;
import com.caseflow.entity.enums.HearingStatus;
import com.caseflow.entity.enums.TaskStatus;
import com.caseflow.repository.*;
import com.caseflow.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.CacheManager;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class WorkflowMonitoringScheduler {

    private final HearingRepository hearingRepository;
    private final TaskRepository taskRepository;
    private final LegalCaseRepository legalCaseRepository;
    private final PendingActionRepository pendingActionRepository;
    private final ClientRequestRepository clientRequestRepository;
    private final NotificationService notificationService;
    private final CacheManager cacheManager;

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");

    @Scheduled(fixedDelay = 300000, initialDelay = 30000)
    @Transactional
    public void runAutomatedCaseMonitoring() {
        log.info("Running CASEFLOW automated workflow monitoring checks...");
        checkUpcomingHearings();
        checkOverdueTasks();
        checkOverduePendingActions();
        checkApproachingCaseDeadlines();
        checkPendingClientRequests();
        evictDashboardCaches();
    }

    private void checkUpcomingHearings() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime next48Hours = now.plusHours(48);
        List<Hearing> upcoming = hearingRepository.findByHearingDateBetweenAndStatusAndReminderSentFalse(
                now, next48Hours, HearingStatus.SCHEDULED);

        for (Hearing h : upcoming) {
            LegalCase c = h.getLegalCase();
            String formatted = h.getHearingDate().format(FORMATTER);
            notificationService.createAndSendNotification(
                    c.getAdvocate(),
                    c,
                    "HEARING_REMINDER",
                    "Hearing Reminder (Within 48h): " + c.getCaseNumber(),
                    "Court hearing for '" + h.getPurpose() + "' is scheduled on " + formatted + " at " + h.getCourtName() + "."
            );
            if (c.getClient().getUserAccount() != null) {
                notificationService.createAndSendNotification(
                        c.getClient().getUserAccount(),
                        c,
                        "HEARING_REMINDER",
                        "Upcoming Hearing Reminder: " + c.getCaseNumber(),
                        "Your hearing for '" + h.getPurpose() + "' is scheduled on " + formatted + " at " + h.getCourtName() + "."
                );
            }
            h.setReminderSent(true);
            hearingRepository.save(h);
        }
    }

    private void checkOverdueTasks() {
        List<Task> overdueTasks = taskRepository.findByDueDateBeforeAndStatusNotIn(
                LocalDate.now(), List.of(TaskStatus.COMPLETED));
        for (Task t : overdueTasks) {
            if (t.getStatus() != TaskStatus.OVERDUE) {
                t.setStatus(TaskStatus.OVERDUE);
            }
            if (!t.isOverdueAlertSent()) {
                notificationService.createAndSendNotification(
                        t.getAssignedAdvocate(),
                        t.getLegalCase(),
                        "OVERDUE_TASK",
                        "Overdue Task Alert: " + t.getTitle(),
                        "Task '" + t.getTitle() + "' for case " + t.getLegalCase().getCaseNumber() + " passed its due date (" + t.getDueDate() + ")."
                );
                t.setOverdueAlertSent(true);
            }
            taskRepository.save(t);
        }
    }

    private void checkOverduePendingActions() {
        List<PendingAction> actions = pendingActionRepository.findByDueDateBeforeAndStatusNotIn(
                LocalDate.now(), List.of(ActionStatus.COMPLETED, ActionStatus.OVERDUE));
        for (PendingAction a : actions) {
            a.setStatus(ActionStatus.OVERDUE);
            pendingActionRepository.save(a);
            notificationService.createAndSendNotification(
                    a.getAdvocate(),
                    a.getLegalCase(),
                    "PENDING_ACTION",
                    "Pending Action Overdue: " + a.getTitle(),
                    "Action awaiting " + a.getResponsibleParty() + " for case " + a.getLegalCase().getCaseNumber() + " is now overdue."
            );
        }
    }

    private void checkApproachingCaseDeadlines() {
        LocalDate today = LocalDate.now();
        List<LegalCase> casesWithDeadlines = legalCaseRepository.findByNextDeadlineBetween(today, today.plusDays(3));
        for (LegalCase c : casesWithDeadlines) {
            log.debug("Case {} has approaching deadline on {}", c.getCaseNumber(), c.getNextDeadline());
        }
    }

    private void checkPendingClientRequests() {
        List<ClientRequest> dueRequests = clientRequestRepository.findByStatusAndDueDateLessThanEqual(
                ClientRequestStatus.PENDING_CLIENT, LocalDate.now().plusDays(1));
        for (ClientRequest r : dueRequests) {
            log.debug("Client request {} for case {} requires follow-up", r.getId(), r.getLegalCase().getCaseNumber());
        }
    }

    private void evictDashboardCaches() {
        try {
            if (cacheManager.getCache("advocateDashboard") != null) {
                cacheManager.getCache("advocateDashboard").clear();
            }
            if (cacheManager.getCache("clientDashboard") != null) {
                cacheManager.getCache("clientDashboard").clear();
            }
        } catch (Exception e) {
            log.debug("Redis cache eviction skipped: {}", e.getMessage());
        }
    }
}
