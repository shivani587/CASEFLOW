package com.caseflow.dto.hearing;

import com.caseflow.entity.enums.HearingStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HearingDto {
    private Long id;

    @NotNull(message = "Case ID is required")
    private Long caseId;
    private String caseNumber;
    private String caseTitle;
    private String clientName;

    @NotNull(message = "Hearing date and time are required")
    private LocalDateTime hearingDate;

    @NotBlank(message = "Court name is required")
    private String courtName;

    private String courtRoom;

    @NotBlank(message = "Hearing purpose is required")
    private String purpose;

    @NotNull(message = "Status is required")
    private HearingStatus status;

    private String outcomeNotes;
    private String nextSteps;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
