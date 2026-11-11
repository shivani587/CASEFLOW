package com.caseflow.dto.casefile;

import com.caseflow.entity.enums.CaseStatus;
import com.caseflow.entity.enums.PriorityLevel;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LegalCaseDto {
    private Long id;

    @NotBlank(message = "Case number is required")
    private String caseNumber;

    @NotBlank(message = "Case title is required")
    private String title;

    @NotBlank(message = "Case type is required")
    private String caseType;

    @NotNull(message = "Case status is required")
    private CaseStatus status;

    @NotNull(message = "Priority is required")
    private PriorityLevel priority;

    @NotBlank(message = "Court name is required")
    private String courtName;

    private String courtHall;
    private String judgeName;
    private String opposingParty;
    private String opposingCounsel;
    private String description;

    @NotNull(message = "Filing date is required")
    private LocalDate filingDate;

    private LocalDate nextDeadline;
    private String deadlineDescription;

    private Long advocateId;
    private String advocateName;

    @NotNull(message = "Client ID is required")
    private Long clientId;
    private String clientName;
    private String clientEmail;
    private String clientPhone;

    private LocalDateTime nextHearingDate;
    private int pendingTasksCount;
    private int missingDocumentsCount;
    private int pendingActionsCount;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
