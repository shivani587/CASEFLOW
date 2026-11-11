package com.caseflow.repository;

import com.caseflow.entity.PendingAction;
import com.caseflow.entity.enums.ActionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface PendingActionRepository extends JpaRepository<PendingAction, Long> {
    List<PendingAction> findByAdvocateIdOrderByDueDateAsc(Long advocateId);
    List<PendingAction> findByLegalCaseIdOrderByDueDateAsc(Long caseId);
    List<PendingAction> findByAdvocateIdAndStatusNotOrderByDueDateAsc(Long advocateId, ActionStatus excludedStatus);
    List<PendingAction> findByDueDateBeforeAndStatusNotIn(LocalDate date, List<ActionStatus> excludedStatuses);
}
