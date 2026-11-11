package com.caseflow.dto.client;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClientDto {
    private Long id;
    private Long userId;
    private Long advocateId;
    private String advocateName;

    @NotBlank(message = "Client full name is required")
    private String fullName;

    @NotBlank(message = "Client email is required")
    @Email(message = "Valid email is required")
    private String email;

    @NotBlank(message = "Client phone is required")
    private String phone;

    private String address;
    private String companyOrOrganization;
    private String identificationReference;
    private String notes;
    private String portalPassword;
    private boolean active;
    private int assignedCasesCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
