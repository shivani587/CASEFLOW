package com.caseflow.repository;

import com.caseflow.entity.CaseUpdate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CaseUpdateRepository extends JpaRepository<CaseUpdate, Long> {
    List<CaseUpdate> findByLegalCaseIdOrderByCreatedAtDesc(Long caseId);
    List<CaseUpdate> findTop10ByLegalCaseAdvocateIdOrderByCreatedAtDesc(Long advocateId);
    List<CaseUpdate> findByLegalCaseClientIdAndVisibleToClientTrueOrderByCreatedAtDesc(Long clientId);
}
