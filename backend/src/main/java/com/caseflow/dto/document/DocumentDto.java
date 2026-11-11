package com.caseflow.dto.document;

import com.caseflow.entity.enums.DocumentStatus;
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
public class DocumentDto {
    private Long id;

    @NotNull(message = "Case ID is required")
    private Long caseId;
    private String caseNumber;
    private String caseTitle;

    private Long clientId;
    private String clientName;

    private Long uploadedByUserId;
    private String uploadedByName;

    @NotBlank(message = "Document title is required")
    private String title;

    @NotBlank(message = "Document category is required")
    private String category;

    private String description;
    private String fileName;
    private String contentType;
    private Long fileSize;
    private DocumentStatus status;
    private String verificationRemarks;
    private LocalDate dueDate;
    private LocalDateTime uploadedAt;
    private LocalDateTime verifiedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
