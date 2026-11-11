package com.caseflow.repository;

import com.caseflow.entity.ClientRequest;
import com.caseflow.entity.enums.ClientRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ClientRequestRepository extends JpaRepository<ClientRequest, Long> {
    List<ClientRequest> findByAdvocateIdOrderByCreatedAtDesc(Long advocateId);
    List<ClientRequest> findByClientIdOrderByCreatedAtDesc(Long clientId);
    List<ClientRequest> findByLegalCaseIdOrderByCreatedAtDesc(Long caseId);
    List<ClientRequest> findByAdvocateIdAndStatusInOrderByDueDateAsc(Long advocateId, List<ClientRequestStatus> statuses);
    List<ClientRequest> findByStatusAndDueDateLessThanEqual(ClientRequestStatus status, LocalDate date);
}
