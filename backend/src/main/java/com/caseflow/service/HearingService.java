package com.caseflow.service;

import com.caseflow.dto.hearing.HearingDto;
import com.caseflow.entity.Client;
import com.caseflow.entity.Hearing;
import com.caseflow.entity.LegalCase;
import com.caseflow.entity.User;
import com.caseflow.exception.AccessDeniedOperationException;
import com.caseflow.exception.ResourceNotFoundException;
import com.caseflow.repository.HearingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HearingService {

    private final HearingRepository hearingRepository;
    private final LegalCaseService legalCaseService;
    private final SecurityContextService securityContextService;
    private final NotificationService notificationService;

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");

    @Transactional(readOnly = true)
    public List<HearingDto> getAdvocateHearings() {
        User advocate = securityContextService.getCurrentAdvocate();
        return hearingRepository.findByLegalCaseAdvocateIdOrderByHearingDateAsc(advocate.getId())
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<HearingDto> getClientHearings() {
        Client client = securityContextService.getCurrentClientProfile();
        return hearingRepository.findByLegalCaseClientIdOrderByHearingDateAsc(client.getId())
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<HearingDto> getHearingsByCase(Long caseId) {
        LegalCase legalCase = legalCaseService.getAuthorizedCase(caseId);
        return hearingRepository.findByLegalCaseIdOrderByHearingDateDesc(legalCase.getId())
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    @CacheEvict(value = {"advocateDashboard", "clientDashboard"}, allEntries = true)
    public HearingDto createHearing(HearingDto dto) {
        User advocate = securityContextService.getCurrentAdvocate();
        LegalCase legalCase = legalCaseService.getAuthorizedCase(dto.getCaseId());

        Hearing hearing = Hearing.builder()
                .legalCase(legalCase)
                .hearingDate(dto.getHearingDate())
                .courtName(dto.getCourtName())
                .courtRoom(dto.getCourtRoom())
                .purpose(dto.getPurpose())
                .status(dto.getStatus())
                .outcomeNotes(dto.getOutcomeNotes())
                .nextSteps(dto.getNextSteps())
                .reminderSent(false)
                .build();

        Hearing saved = hearingRepository.save(hearing);
        String formattedDate = saved.getHearingDate().format(FORMATTER);

        legalCaseService.recordCaseUpdateInternal(
                legalCase, advocate, "HEARING_SCHEDULED",
                "Hearing Scheduled: " + formattedDate,
                "Purpose: " + saved.getPurpose() + " at " + saved.getCourtName() +
                        (saved.getCourtRoom() != null ? " (" + saved.getCourtRoom() + ")" : ""),
                true
        );

        if (legalCase.getClient().getUserAccount() != null) {
            notificationService.createAndSendNotification(
                    legalCase.getClient().getUserAccount(),
                    legalCase,
                    "UPCOMING_HEARING",
                    "New Hearing Scheduled: " + legalCase.getCaseNumber(),
                    "A court hearing for '" + saved.getPurpose() + "' is scheduled on " + formattedDate + " at " + saved.getCourtName() + "."
            );
        }

        return toDto(saved);
    }

    @Transactional
    @CacheEvict(value = {"advocateDashboard", "clientDashboard"}, allEntries = true)
    public HearingDto updateHearing(Long hearingId, HearingDto dto) {
        User advocate = securityContextService.getCurrentAdvocate();
        Hearing hearing = hearingRepository.findById(hearingId)
                .orElseThrow(() -> new ResourceNotFoundException("Hearing not found"));
        if (!hearing.getLegalCase().getAdvocate().getId().equals(advocate.getId())) {
            throw new AccessDeniedOperationException("Not authorized to update this hearing");
        }

        hearing.setHearingDate(dto.getHearingDate());
        hearing.setCourtName(dto.getCourtName());
        hearing.setCourtRoom(dto.getCourtRoom());
        hearing.setPurpose(dto.getPurpose());
        hearing.setStatus(dto.getStatus());
        hearing.setOutcomeNotes(dto.getOutcomeNotes());
        hearing.setNextSteps(dto.getNextSteps());

        Hearing saved = hearingRepository.save(hearing);
        String formattedDate = saved.getHearingDate().format(FORMATTER);

        legalCaseService.recordCaseUpdateInternal(
                hearing.getLegalCase(), advocate, "HEARING_UPDATED",
                "Hearing Updated (" + saved.getStatus() + "): " + formattedDate,
                "Outcome/Notes: " + (saved.getOutcomeNotes() != null ? saved.getOutcomeNotes() : "Updated schedule"),
                true
        );

        if (hearing.getLegalCase().getClient().getUserAccount() != null) {
            notificationService.createAndSendNotification(
                    hearing.getLegalCase().getClient().getUserAccount(),
                    hearing.getLegalCase(),
                    "UPCOMING_HEARING",
                    "Hearing Update: " + hearing.getLegalCase().getCaseNumber(),
                    "Hearing on " + formattedDate + " is now marked as " + saved.getStatus() + "."
            );
        }

        return toDto(saved);
    }

    public HearingDto toDto(Hearing h) {
        return HearingDto.builder()
                .id(h.getId())
                .caseId(h.getLegalCase().getId())
                .caseNumber(h.getLegalCase().getCaseNumber())
                .caseTitle(h.getLegalCase().getTitle())
                .clientName(h.getLegalCase().getClient().getFullName())
                .hearingDate(h.getHearingDate())
                .courtName(h.getCourtName())
                .courtRoom(h.getCourtRoom())
                .purpose(h.getPurpose())
                .status(h.getStatus())
                .outcomeNotes(h.getOutcomeNotes())
                .nextSteps(h.getNextSteps())
                .createdAt(h.getCreatedAt())
                .updatedAt(h.getUpdatedAt())
                .build();
    }
}
