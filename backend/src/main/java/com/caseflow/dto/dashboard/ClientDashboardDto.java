package com.caseflow.dto.dashboard;

import com.caseflow.dto.casefile.CaseUpdateDto;
import com.caseflow.dto.casefile.LegalCaseDto;
import com.caseflow.dto.document.DocumentDto;
import com.caseflow.dto.hearing.HearingDto;
import com.caseflow.dto.request.ClientRequestDto;
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
public class ClientDashboardDto implements Serializable {
    private String clientName;
    private String advocateName;
    private String advocateEmail;
    private String advocatePhone;

    private long assignedCasesCount;
    private long upcomingHearingsCount;
    private long requiredDocumentsCount;
    private long awaitingVerificationCount;
    private long pendingRequestsCount;
    private long unreadNotificationsCount;

    private List<LegalCaseDto> assignedCases;
    private List<HearingDto> upcomingHearings;
    private List<DocumentDto> requiredAndSubmittedDocuments;
    private List<ClientRequestDto> pendingRequests;
    private List<CaseUpdateDto> recentCaseUpdates;
}
