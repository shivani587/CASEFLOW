package com.caseflow.repository;

import com.caseflow.entity.Document;
import com.caseflow.entity.enums.DocumentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {
    List<Document> findByLegalCaseAdvocateIdOrderByUpdatedAtDesc(Long advocateId);
    List<Document> findByLegalCaseClientIdOrderByUpdatedAtDesc(Long clientId);
    List<Document> findByLegalCaseIdOrderByUpdatedAtDesc(Long caseId);
    List<Document> findByLegalCaseAdvocateIdAndStatusOrderByUpdatedAtDesc(Long advocateId, DocumentStatus status);
    List<Document> findByLegalCaseClientIdAndStatusInOrderByUpdatedAtDesc(Long clientId, List<DocumentStatus> statuses);
}
