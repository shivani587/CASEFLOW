package com.caseflow.dto.casefile;

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
public class CaseUpdateDto {
    private Long id;

    @NotNull(message = "Case ID is required")
    private Long caseId;
    private String caseNumber;
    private String caseTitle;

    private Long authorUserId;
    private String authorName;

    @NotBlank(message = "Update type is required")
    private String updateType;

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Details are required")
    private String details;

    private boolean visibleToClient;
    private LocalDateTime createdAt;
}
