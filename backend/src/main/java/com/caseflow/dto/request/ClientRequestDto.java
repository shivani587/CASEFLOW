package com.caseflow.dto.request;

import com.caseflow.entity.enums.ClientRequestStatus;
import com.caseflow.entity.enums.ClientRequestType;
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
public class ClientRequestDto {
    private Long id;

    @NotNull(message = "Case ID is required")
    private Long caseId;
    private String caseNumber;
    private String caseTitle;

    @NotNull(message = "Client ID is required")
    private Long clientId;
    private String clientName;

    private Long advocateId;
    private String advocateName;

    @NotBlank(message = "Title is required")
    private String title;

    @NotNull(message = "Request type is required")
    private ClientRequestType requestType;

    @NotBlank(message = "Instructions are required")
    private String instructions;

    private String clientResponse;
    private String advocateReviewNotes;
    private ClientRequestStatus status;

    @NotNull(message = "Due date is required")
    private LocalDate dueDate;

    private boolean overdue;
    private LocalDateTime respondedAt;
    private LocalDateTime reviewedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
