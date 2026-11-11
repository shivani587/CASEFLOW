package com.caseflow.service;

import com.caseflow.dto.client.ClientDto;
import com.caseflow.entity.Client;
import com.caseflow.entity.User;
import com.caseflow.entity.enums.Role;
import com.caseflow.exception.AccessDeniedOperationException;
import com.caseflow.exception.BadRequestException;
import com.caseflow.exception.ResourceNotFoundException;
import com.caseflow.repository.ClientRepository;
import com.caseflow.repository.LegalCaseRepository;
import com.caseflow.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClientService {

    private final ClientRepository clientRepository;
    private final UserRepository userRepository;
    private final LegalCaseRepository legalCaseRepository;
    private final PasswordEncoder passwordEncoder;
    private final SecurityContextService securityContextService;

    @Transactional(readOnly = true)
    public List<ClientDto> getAdvocateClients() {
        User advocate = securityContextService.getCurrentAdvocate();
        return clientRepository.findByAdvocateIdOrderByCreatedAtDesc(advocate.getId())
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ClientDto getClientById(Long clientId) {
        User advocate = securityContextService.getCurrentAdvocate();
        Client client = clientRepository.findById(clientId)
                .orElseThrow(() -> new ResourceNotFoundException("Client not found"));
        if (!client.getAdvocate().getId().equals(advocate.getId())) {
            throw new AccessDeniedOperationException("Access denied to this client profile");
        }
        return toDto(client);
    }

    @Transactional
    @CacheEvict(value = "advocateDashboard", allEntries = true)
    public ClientDto createClient(ClientDto dto) {
        User advocate = securityContextService.getCurrentAdvocate();
        String email = dto.getEmail().trim().toLowerCase();

        if (clientRepository.findByEmailIgnoreCaseAndAdvocateId(email, advocate.getId()).isPresent()) {
            throw new BadRequestException("A client with this email is already registered under your practice");
        }

        User clientUserAccount = null;
        Optional<User> existingUser = userRepository.findByEmailIgnoreCase(email);
        if (existingUser.isPresent()) {
            clientUserAccount = existingUser.get();
        } else {
            String rawPassword = StringUtils.hasText(dto.getPortalPassword()) ? dto.getPortalPassword() : "Client@123";
            User newUser = User.builder()
                    .fullName(dto.getFullName().trim())
                    .email(email)
                    .passwordHash(passwordEncoder.encode(rawPassword))
                    .phone(dto.getPhone())
                    .role(Role.CLIENT)
                    .active(true)
                    .build();
            clientUserAccount = userRepository.save(newUser);
        }

        Client client = Client.builder()
                .userAccount(clientUserAccount)
                .advocate(advocate)
                .fullName(dto.getFullName().trim())
                .email(email)
                .phone(dto.getPhone())
                .address(dto.getAddress())
                .companyOrOrganization(dto.getCompanyOrOrganization())
                .identificationReference(dto.getIdentificationReference())
                .notes(dto.getNotes())
                .active(true)
                .build();

        return toDto(clientRepository.save(client));
    }

    @Transactional
    @CacheEvict(value = "advocateDashboard", allEntries = true)
    public ClientDto updateClient(Long clientId, ClientDto dto) {
        User advocate = securityContextService.getCurrentAdvocate();
        Client client = clientRepository.findById(clientId)
                .orElseThrow(() -> new ResourceNotFoundException("Client not found"));
        if (!client.getAdvocate().getId().equals(advocate.getId())) {
            throw new AccessDeniedOperationException("Access denied to this client profile");
        }

        client.setFullName(dto.getFullName().trim());
        client.setPhone(dto.getPhone());
        client.setAddress(dto.getAddress());
        client.setCompanyOrOrganization(dto.getCompanyOrOrganization());
        client.setIdentificationReference(dto.getIdentificationReference());
        client.setNotes(dto.getNotes());
        client.setActive(dto.isActive());

        if (client.getUserAccount() != null) {
            User u = client.getUserAccount();
            u.setFullName(dto.getFullName().trim());
            u.setPhone(dto.getPhone());
            userRepository.save(u);
        }

        return toDto(clientRepository.save(client));
    }

    public ClientDto toDto(Client c) {
        int casesCount = legalCaseRepository.findByClientIdOrderByUpdatedAtDesc(c.getId()).size();
        return ClientDto.builder()
                .id(c.getId())
                .userId(c.getUserAccount() != null ? c.getUserAccount().getId() : null)
                .advocateId(c.getAdvocate().getId())
                .advocateName(c.getAdvocate().getFullName())
                .fullName(c.getFullName())
                .email(c.getEmail())
                .phone(c.getPhone())
                .address(c.getAddress())
                .companyOrOrganization(c.getCompanyOrOrganization())
                .identificationReference(c.getIdentificationReference())
                .notes(c.getNotes())
                .active(c.isActive())
                .assignedCasesCount(casesCount)
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
                .build();
    }
}
