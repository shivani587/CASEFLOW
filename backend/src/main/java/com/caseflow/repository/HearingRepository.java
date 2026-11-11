package com.caseflow.repository;

import com.caseflow.entity.Hearing;
import com.caseflow.entity.enums.HearingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface HearingRepository extends JpaRepository<Hearing, Long> {
    List<Hearing> findByLegalCaseAdvocateIdOrderByHearingDateAsc(Long advocateId);
    List<Hearing> findByLegalCaseClientIdOrderByHearingDateAsc(Long clientId);
    List<Hearing> findByLegalCaseIdOrderByHearingDateDesc(Long caseId);
    List<Hearing> findByLegalCaseAdvocateIdAndHearingDateGreaterThanEqualAndStatusOrderByHearingDateAsc(
            Long advocateId, LocalDateTime fromDate, HearingStatus status);
    List<Hearing> findByHearingDateBetweenAndStatusAndReminderSentFalse(
            LocalDateTime start, LocalDateTime end, HearingStatus status);
}
