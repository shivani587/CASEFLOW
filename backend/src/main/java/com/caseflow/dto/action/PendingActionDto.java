package com.caseflow.dto.action;

import com.caseflow.entity.enums.ActionStatus;
import com.caseflow.entity.enums.PartyType;
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
public class PendingActionDto {
    private Long id;

    @NotNull(message = "Case ID is required")
    private Long caseId;
    private String caseNumber;
    private String caseTitle;
    private String clientName;

    private Long advocateId;

    @NotBlank(message = "Action title is required")
    private String title;

    @NotBlank(message = "Responsible party is required")
    private String responsibleParty;

    @NotNull(message = "Party type is required")
    private PartyType partyType;

    @NotBlank(message = "Instructions are required")
    private String instructions;

    @NotNull(message = "Status is required")
    private ActionStatus status;

    @NotNull(message = "Due date is required")
    private LocalDate dueDate;

    private String resolutionNotes;
    private boolean overdue;
    private LocalDateTime completedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
