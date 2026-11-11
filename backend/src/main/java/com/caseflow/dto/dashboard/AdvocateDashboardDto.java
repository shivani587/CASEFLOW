package com.caseflow.dto.dashboard;

import com.caseflow.dto.action.PendingActionDto;
import com.caseflow.dto.casefile.CaseUpdateDto;
import com.caseflow.dto.casefile.LegalCaseDto;
import com.caseflow.dto.document.DocumentDto;
import com.caseflow.dto.hearing.HearingDto;
import com.caseflow.dto.request.ClientRequestDto;
import com.caseflow.dto.task.TaskDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdvocateDashboardDto implements Serializable {
    private long totalCases;
    private long activeCases;
    private long totalClients;
    private long upcomingHearingsCount;
    private long urgentTasksCount;
    private long overdueTasksCount;
    private long missingDocumentsCount;
    private long awaitingVerificationDocumentsCount;
    private long pendingActionsCount;
    private long requiredClientFollowUpsCount;
    private long upcomingDeadlinesCount;

    private List<HearingDto> upcomingHearings;
    private List<TaskDto> urgentAndOverdueTasks;
    private List<DocumentDto> documentsNeedingAttention;
    private List<PendingActionDto> pendingActions;
    private List<ClientRequestDto> clientFollowUps;
    private List<LegalCaseDto> upcomingDeadlines;
    private List<CaseUpdateDto> recentCaseUpdates;
}
