package com.caseflow.repository;

import com.caseflow.entity.LegalCase;
import com.caseflow.entity.enums.CaseStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface LegalCaseRepository extends JpaRepository<LegalCase, Long> {
    List<LegalCase> findByAdvocateIdOrderByUpdatedAtDesc(Long advocateId);
    List<LegalCase> findByClientIdOrderByUpdatedAtDesc(Long clientId);
    Optional<LegalCase> findByCaseNumberIgnoreCase(String caseNumber);
    boolean existsByCaseNumberIgnoreCase(String caseNumber);
    long countByAdvocateId(Long advocateId);
    long countByAdvocateIdAndStatusNotIn(Long advocateId, List<CaseStatus> statuses);
    List<LegalCase> findByAdvocateIdAndNextDeadlineBetweenOrderByNextDeadlineAsc(Long advocateId, LocalDate start, LocalDate end);
    List<LegalCase> findByAdvocateIdAndNextDeadlineBeforeAndStatusNotIn(Long advocateId, LocalDate date, List<CaseStatus> excludedStatuses);
    List<LegalCase> findByNextDeadlineBetween(LocalDate start, LocalDate end);
}
