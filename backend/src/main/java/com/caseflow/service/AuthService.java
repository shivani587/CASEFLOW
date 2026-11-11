package com.caseflow.service;

import com.caseflow.dto.auth.AuthResponse;
import com.caseflow.dto.auth.LoginRequest;
import com.caseflow.dto.auth.RegisterRequest;
import com.caseflow.dto.auth.UserProfileDto;
import com.caseflow.entity.Client;
import com.caseflow.entity.User;
import com.caseflow.entity.enums.Role;
import com.caseflow.exception.BadRequestException;
import com.caseflow.repository.ClientRepository;
import com.caseflow.repository.UserRepository;
import com.caseflow.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final ClientRepository clientRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final SecurityContextService securityContextService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmailIgnoreCase(request.getEmail())) {
            throw new BadRequestException("An account with this email already exists");
        }

        User user = User.builder()
                .fullName(request.getFullName().trim())
                .email(request.getEmail().trim().toLowerCase())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .role(request.getRole())
                .barRegistrationNo(request.getBarRegistrationNo())
                .specialization(request.getSpecialization())
                .active(true)
                .build();

        User savedUser = userRepository.save(user);
        Long clientId = null;

        if (request.getRole() == Role.CLIENT) {
            User advocate = null;
            if (request.getAssociatedAdvocateId() != null) {
                advocate = userRepository.findById(request.getAssociatedAdvocateId()).orElse(null);
            }
            if (advocate == null) {
                List<User> advocates = userRepository.findByRole(Role.ADVOCATE);
                if (!advocates.isEmpty()) {
                    advocate = advocates.get(0);
                }
            }
            if (advocate != null) {
                Client client = Client.builder()
                        .userAccount(savedUser)
                        .advocate(advocate)
                        .fullName(savedUser.getFullName())
                        .email(savedUser.getEmail())
                        .phone(savedUser.getPhone())
                        .address(request.getAddress())
                        .companyOrOrganization(request.getCompanyOrOrganization())
                        .active(true)
                        .build();
                Client savedClient = clientRepository.save(client);
                clientId = savedClient.getId();
            }
        }

        String token = jwtTokenProvider.generateToken(savedUser);
        return AuthResponse.builder()
                .token(token)
                .userId(savedUser.getId())
                .clientId(clientId)
                .fullName(savedUser.getFullName())
                .email(savedUser.getEmail())
                .phone(savedUser.getPhone())
                .role(savedUser.getRole())
                .barRegistrationNo(savedUser.getBarRegistrationNo())
                .specialization(savedUser.getSpecialization())
                .build();
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail().trim().toLowerCase(), request.getPassword())
        );

        User user = userRepository.findByEmailIgnoreCase(request.getEmail().trim())
                .orElseThrow(() -> new BadRequestException("Invalid credentials"));

        Long clientId = null;
        if (user.getRole() == Role.CLIENT) {
            Optional<Client> clientOpt = clientRepository.findByUserAccountId(user.getId());
            if (clientOpt.isPresent()) {
                clientId = clientOpt.get().getId();
            }
        }

        String token = jwtTokenProvider.generateToken(user);
        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .clientId(clientId)
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .barRegistrationNo(user.getBarRegistrationNo())
                .specialization(user.getSpecialization())
                .build();
    }

    @Transactional(readOnly = true)
    public UserProfileDto getProfile() {
        User user = securityContextService.getCurrentUser();
        UserProfileDto.UserProfileDtoBuilder builder = UserProfileDto.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .barRegistrationNo(user.getBarRegistrationNo())
                .specialization(user.getSpecialization());

        if (user.getRole() == Role.CLIENT) {
            clientRepository.findByUserAccountId(user.getId()).ifPresent(client -> {
                builder.clientId(client.getId());
                builder.address(client.getAddress());
                builder.companyOrOrganization(client.getCompanyOrOrganization());
            });
        }
        return builder.build();
    }

    @Transactional
    public UserProfileDto updateProfile(UserProfileDto request) {
        User user = securityContextService.getCurrentUser();
        user.setFullName(request.getFullName());
        user.setPhone(request.getPhone());
        if (user.getRole() == Role.ADVOCATE) {
            user.setBarRegistrationNo(request.getBarRegistrationNo());
            user.setSpecialization(request.getSpecialization());
        }
        userRepository.save(user);

        if (user.getRole() == Role.CLIENT) {
            clientRepository.findByUserAccountId(user.getId()).ifPresent(client -> {
                client.setFullName(request.getFullName());
                client.setPhone(request.getPhone());
                client.setAddress(request.getAddress());
                client.setCompanyOrOrganization(request.getCompanyOrOrganization());
                clientRepository.save(client);
            });
        }
        return getProfile();
    }
}
