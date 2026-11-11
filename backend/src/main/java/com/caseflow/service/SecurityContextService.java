package com.caseflow.service;

import com.caseflow.entity.Client;
import com.caseflow.entity.User;
import com.caseflow.entity.enums.Role;
import com.caseflow.exception.AccessDeniedOperationException;
import com.caseflow.exception.ResourceNotFoundException;
import com.caseflow.repository.ClientRepository;
import com.caseflow.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SecurityContextService {

    private final UserRepository userRepository;
    private final ClientRepository clientRepository;

    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AccessDeniedOperationException("User is not authenticated");
        }
        String email = authentication.getName();
        return userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));
    }

    public User getCurrentAdvocate() {
        User user = getCurrentUser();
        if (user.getRole() != Role.ADVOCATE) {
            throw new AccessDeniedOperationException("Only advocates are authorized to perform this operation");
        }
        return user;
    }

    public Client getCurrentClientProfile() {
        User user = getCurrentUser();
        if (user.getRole() != Role.CLIENT) {
            throw new AccessDeniedOperationException("Only clients can access client portal resources");
        }
        return clientRepository.findByUserAccountId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Client profile not linked to this account"));
    }
}
