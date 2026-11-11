package com.caseflow.repository;

import com.caseflow.entity.Client;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClientRepository extends JpaRepository<Client, Long> {
    List<Client> findByAdvocateIdOrderByCreatedAtDesc(Long advocateId);
    Optional<Client> findByUserAccountId(Long userId);
    Optional<Client> findByEmailIgnoreCaseAndAdvocateId(String email, Long advocateId);
    long countByAdvocateId(Long advocateId);
}
