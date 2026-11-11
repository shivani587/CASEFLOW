package com.caseflow.entity;

import com.caseflow.entity.enums.CaseStatus;
import com.caseflow.entity.enums.PriorityLevel;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "legal_cases")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LegalCase {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "case_number", nullable = false, unique = true, length = 100)
    private String caseNumber;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(name = "case_type", nullable = false, length = 80)
    private String caseType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private CaseStatus status;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private PriorityLevel priority;

    @Column(name = "court_name", nullable = false, length = 200)
    private String courtName;

    @Column(name = "court_hall", length = 100)
    private String courtHall;

    @Column(name = "judge_name", length = 150)
    private String judgeName;

    @Column(name = "opposing_party", length = 200)
    private String opposingParty;

    @Column(name = "opposing_counsel", length = 200)
    private String opposingCounsel;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "filing_date", nullable = false)
    private LocalDate filingDate;

    @Column(name = "next_deadline")
    private LocalDate nextDeadline;

    @Column(name = "deadline_description", length = 255)
    private String deadlineDescription;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "advocate_id", nullable = false)
    private User advocate;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
