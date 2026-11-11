package com.caseflow.dto.auth;

import com.caseflow.entity.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileDto {
    private Long id;
    private Long clientId;
    private String fullName;
    private String email;
    private String phone;
    private Role role;
    private String barRegistrationNo;
    private String specialization;
    private String address;
    private String companyOrOrganization;
}
