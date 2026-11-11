package com.caseflow.config;

import com.caseflow.entity.*;
import com.caseflow.entity.enums.*;
import com.caseflow.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class DatabaseSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ClientRepository clientRepository;
    private final LegalCaseRepository legalCaseRepository;
    private final HearingRepository hearingRepository;
    private final TaskRepository taskRepository;
    private final DocumentRepository documentRepository;
    private final PendingActionRepository pendingActionRepository;
    private final ClientRequestRepository clientRequestRepository;
    private final CaseUpdateRepository caseUpdateRepository;
    private final NotificationRepository notificationRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() > 0) {
            log.info("Database already seeded. Skipping initial seed.");
            return;
        }

        log.info("Seeding initial CASEFLOW legal practice data...");

        User advocate = userRepository.save(User.builder()
                .fullName("Adv. Arjun Deshmukh")
                .email("advocate@caseflow.legal")
                .passwordHash(passwordEncoder.encode("Advocate@123"))
                .phone("+91 98490 11223")
                .role(Role.ADVOCATE)
                .barRegistrationNo("TS/1428/2015")
                .specialization("Civil, Commercial & Constitutional Litigation")
                .active(true)
                .build());

        User clientUser1 = userRepository.save(User.builder()
                .fullName("Meera Krishnan")
                .email("client@caseflow.legal")
                .passwordHash(passwordEncoder.encode("Client@123"))
                .phone("+91 98490 44556")
                .role(Role.CLIENT)
                .active(true)
                .build());

        User clientUser2 = userRepository.save(User.builder()
                .fullName("Vikramaditya Rao")
                .email("vikram.rao@horizoninfra.in")
                .passwordHash(passwordEncoder.encode("Client@123"))
                .phone("+91 98490 77889")
                .role(Role.CLIENT)
                .active(true)
                .build());

        Client client1 = clientRepository.save(Client.builder()
                .userAccount(clientUser1)
                .advocate(advocate)
                .fullName("Meera Krishnan")
                .email("client@caseflow.legal")
                .phone("+91 98490 44556")
                .address("Plot 42, Jubilee Hills Road No. 36, Hyderabad, Telangana")
                .companyOrOrganization("Krishnan Heritage Estates")
                .identificationReference("PAN: AABCK4921L")
                .notes("Primary petitioner in ancestral property partition and injunction suit.")
                .active(true)
                .build());

        Client client2 = clientRepository.save(Client.builder()
                .userAccount(clientUser2)
                .advocate(advocate)
                .fullName("Vikramaditya Rao")
                .email("vikram.rao@horizoninfra.in")
                .phone("+91 98490 77889")
                .address("Level 8, Knowledge City, Raidurg, Hyderabad, Telangana")
                .companyOrOrganization("Horizon InfraTech Pvt. Ltd.")
                .identificationReference("CIN: U45200TG2018PTC125430")
                .notes("Corporate commercial arbitration & contract enforcement matter.")
                .active(true)
                .build());

        LegalCase case1 = legalCaseRepository.save(LegalCase.builder()
                .caseNumber("OS/418/2026")
                .title("Meera Krishnan vs. Deccan Land Developers & Ors.")
                .caseType("Civil Suit - Injunction & Title Declaration")
                .status(CaseStatus.AWAITING_HEARING)
                .priority(PriorityLevel.URGENT)
                .courtName("City Civil Court, Hyderabad")
                .courtHall("Court Hall IV")
                .judgeName("Hon'ble Sri Justice K. Venkatramana")
                .opposingParty("Deccan Land Developers Pvt. Ltd.")
                .opposingCounsel("Adv. R. Narasimha Murthy")
                .description("Suit for declaration of title and permanent injunction restraining respondents from alienating Schedule-A property measuring 2,400 sq. yards.")
                .filingDate(LocalDate.now().minusMonths(3))
                .nextDeadline(LocalDate.now().plusDays(4))
                .deadlineDescription("File Rejoinder Affidavit & Certified Link Documents")
                .advocate(advocate)
                .client(client1)
                .build());

        LegalCase case2 = legalCaseRepository.save(LegalCase.builder()
                .caseNumber("COP/112/2026")
                .title("Horizon InfraTech Pvt. Ltd. vs. Metro Logistics Corp.")
                .caseType("Commercial Arbitration Petition")
                .status(CaseStatus.IN_PROGRESS)
                .priority(PriorityLevel.HIGH)
                .courtName("Commercial Court, Ranga Reddy District")
                .courtHall("Commercial Bench II")
                .judgeName("Hon'ble Smt. Justice P. Madhavi Devi")
                .opposingParty("Metro Logistics Corporation")
                .opposingCounsel("Adv. S. Chakravarthy")
                .description("Section 9 Commercial Arbitration petition seeking interim bank guarantee attachment for breach of EPC supply agreement.")
                .filingDate(LocalDate.now().minusMonths(1))
                .nextDeadline(LocalDate.now().plusDays(9))
                .deadlineDescription("Submit Statement of Claim & Audited Ledger Annexures")
                .advocate(advocate)
                .client(client2)
                .build());

        LegalCase case3 = legalCaseRepository.save(LegalCase.builder()
                .caseNumber("WP/8821/2026")
                .title("Meera Krishnan vs. Municipal Corporation & Revenue Dept.")
                .caseType("Writ Petition (Mandamus)")
                .status(CaseStatus.PENDING_CLIENT)
                .priority(PriorityLevel.MEDIUM)
                .courtName("High Court for the State of Telangana")
                .courtHall("Bench VI")
                .judgeName("Hon'ble Justice B. Vijaysen Reddy")
                .opposingParty("Greater Hyderabad Municipal Corporation")
                .opposingCounsel("Government Pleader for Municipal Admin")
                .description("Writ Petition challenging arbitrary mutation cancellation notice without prior hearing under Section 450.")
                .filingDate(LocalDate.now().minusWeeks(6))
                .nextDeadline(LocalDate.now().plusDays(2))
                .deadlineDescription("File Counter-Reply to Municipal Notice")
                .advocate(advocate)
                .client(client1)
                .build());

        hearingRepository.save(Hearing.builder()
                .legalCase(case1)
                .hearingDate(LocalDateTime.now().plusDays(2).withHour(10).withMinute(30).withSecond(0).withNano(0))
                .courtName("City Civil Court, Hyderabad")
                .courtRoom("Court Hall IV")
                .purpose("Arguments on Interim Injunction Application (IA No. 92/2026)")
                .status(HearingStatus.SCHEDULED)
                .outcomeNotes("Prepare certified revenue records and encumbrance certificates.")
                .nextSteps("Present oral arguments on prima facie title and balance of convenience.")
                .reminderSent(false)
                .build());

        hearingRepository.save(Hearing.builder()
                .legalCase(case2)
                .hearingDate(LocalDateTime.now().plusDays(6).withHour(14).withMinute(15).withSecond(0).withNano(0))
                .courtName("Commercial Court, Ranga Reddy District")
                .courtRoom("Commercial Bench II")
                .purpose("Verify Bank Guarantee Schedule & Interim Attachment")
                .status(HearingStatus.SCHEDULED)
                .outcomeNotes("Opposing counsel directed to produce bank guarantee original.")
                .nextSteps("Cross-verify invoice default computation sheet.")
                .reminderSent(false)
                .build());

        hearingRepository.save(Hearing.builder()
                .legalCase(case1)
                .hearingDate(LocalDateTime.now().minusDays(14).withHour(11).withMinute(0).withSecond(0).withNano(0))
                .courtName("City Civil Court, Hyderabad")
                .courtRoom("Court Hall IV")
                .purpose("Notice Return & Counter Filing by Respondent No. 1")
                .status(HearingStatus.COMPLETED)
                .outcomeNotes("Respondent filed written statement; interim status quo extended till next hearing.")
                .nextSteps("Draft rejoinder affidavit addressing paragraphs 8-14 of written statement.")
                .reminderSent(true)
                .build());

        taskRepository.save(Task.builder()
                .legalCase(case1)
                .assignedAdvocate(advocate)
                .title("Finalize Rejoinder Affidavit in IA No. 92/2026")
                .description("Address respondent's contention regarding 1998 link sale deed and attach certified survey map.")
                .priority(PriorityLevel.URGENT)
                .status(TaskStatus.IN_PROGRESS)
                .dueDate(LocalDate.now().plusDays(1))
                .overdueAlertSent(false)
                .build());

        taskRepository.save(Task.builder()
                .legalCase(case3)
                .assignedAdvocate(advocate)
                .title("File Memo of Appearance & Stay Extension Petition")
                .description("Submit urgent stay extension memo before High Court Registry prior to listing.")
                .priority(PriorityLevel.URGENT)
                .status(TaskStatus.OVERDUE)
                .dueDate(LocalDate.now().minusDays(1))
                .overdueAlertSent(true)
                .build());

        taskRepository.save(Task.builder()
                .legalCase(case2)
                .assignedAdvocate(advocate)
                .title("Prepare Damages Quantification Table for Section 9 Petition")
                .description("Compile delayed milestone interest calculations under Clause 18.4 of the EPC Contract.")
                .priority(PriorityLevel.HIGH)
                .status(TaskStatus.PENDING)
                .dueDate(LocalDate.now().plusDays(5))
                .overdueAlertSent(false)
                .build());

        documentRepository.save(Document.builder()
                .legalCase(case1)
                .client(client1)
                .title("Certified Encumbrance Certificate (2010–2026)")
                .category("Property & Revenue Record")
                .description("Sub-Registrar certified EC covering Survey No. 114/B.")
                .status(DocumentStatus.REQUIRED)
                .dueDate(LocalDate.now().plusDays(2))
                .build());

        documentRepository.save(Document.builder()
                .legalCase(case3)
                .client(client1)
                .title("Property Tax Assessment Receipts (Last 5 Years)")
                .category("Municipal Record")
                .description("GHMC online tax payment receipts establishing continuous possession.")
                .status(DocumentStatus.REQUIRED)
                .dueDate(LocalDate.now().plusDays(3))
                .build());

        documentRepository.save(Document.builder()
                .legalCase(case2)
                .client(client2)
                .uploadedBy(clientUser2)
                .title("Signed EPC Supply Contract & Addendum II")
                .category("Contract & Agreement")
                .description("Executed master agreement dated 14-Mar-2024.")
                .fileName("EPC_Supply_Contract_Addendum2.pdf")
                .contentType("application/pdf")
                .fileSize(428190L)
                .status(DocumentStatus.AWAITING_VERIFICATION)
                .verificationRemarks("Submitted by client, awaiting advocate verification")
                .dueDate(LocalDate.now().plusDays(1))
                .uploadedAt(LocalDateTime.now().minusHours(6))
                .build());

        pendingActionRepository.save(PendingAction.builder()
                .legalCase(case1)
                .advocate(advocate)
                .title("Obtain Certified Copy of 1998 Link Deed from SRO Banjara Hills")
                .responsibleParty("Meera Krishnan (Client)")
                .partyType(PartyType.CLIENT)
                .instructions("Collect certified copy application #CC-8821 from Sub-Registrar Office and upload scan.")
                .status(ActionStatus.PENDING)
                .dueDate(LocalDate.now().plusDays(2))
                .build());

        pendingActionRepository.save(PendingAction.builder()
                .legalCase(case2)
                .advocate(advocate)
                .title("Serve Section 9 Notice Copy on Opposing Counsel")
                .responsibleParty("Adv. S. Chakravarthy (Opposing Counsel)")
                .partyType(PartyType.OPPOSING_COUNSEL)
                .instructions("File proof of service acknowledgment with Commercial Court Registry.")
                .status(ActionStatus.IN_PROGRESS)
                .dueDate(LocalDate.now().plusDays(3))
                .build());

        clientRequestRepository.save(ClientRequest.builder()
                .legalCase(case1)
                .client(client1)
                .advocate(advocate)
                .title("Verify Boundary Schedule & Neighbour Witness Details")
                .requestType(ClientRequestType.INFORMATION_REQUEST)
                .instructions("Please confirm the exact North and East boundary plot owners' names and provide contact details of two attesting witnesses.")
                .status(ClientRequestStatus.PENDING_CLIENT)
                .dueDate(LocalDate.now().plusDays(2))
                .build());

        clientRequestRepository.save(ClientRequest.builder()
                .legalCase(case3)
                .client(client1)
                .advocate(advocate)
                .title("Approve Draft Writ Rejoinder Verification Statement")
                .requestType(ClientRequestType.AFFIDAVIT_SIGNATURE)
                .instructions("Please review the dates of the municipal show-cause notice mentioned in Para 4 and confirm accuracy.")
                .clientResponse("Reviewed Para 4. The notice was served on 18th August, not 15th August. All other facts are accurate.")
                .status(ClientRequestStatus.SUBMITTED_BY_CLIENT)
                .dueDate(LocalDate.now().plusDays(1))
                .respondedAt(LocalDateTime.now().minusHours(4))
                .build());

        caseUpdateRepository.save(CaseUpdate.builder()
                .legalCase(case1)
                .author(advocate)
                .updateType("INTERIM_ORDER")
                .title("Interim Status Quo Order Extended")
                .details("Hon'ble Court extended the interim status quo order restraining third-party alienation until the next hearing date.")
                .visibleToClient(true)
                .build());

        caseUpdateRepository.save(CaseUpdate.builder()
                .legalCase(case2)
                .author(advocate)
                .updateType("NOTICE_ISSUED")
                .title("Urgent Notice Issued to Respondent Bank & Metro Logistics")
                .details("Commercial Bench II issued urgent notice returnable next week regarding bank guarantee invocation.")
                .visibleToClient(true)
                .build());

        notificationRepository.save(Notification.builder()
                .recipient(advocate)
                .legalCase(case3)
                .type("CLIENT_RESPONSE")
                .title("Client Responded: Approve Draft Writ Rejoinder")
                .message("Meera Krishnan submitted a response for WP/8821/2026 awaiting your review.")
                .read(false)
                .build());

        notificationRepository.save(Notification.builder()
                .recipient(clientUser1)
                .legalCase(case1)
                .type("UPCOMING_HEARING")
                .title("Upcoming Hearing in OS/418/2026")
                .message("Arguments on Interim Injunction Application scheduled at City Civil Court, Hall IV.")
                .read(false)
                .build());

        log.info("CASEFLOW seed completed. Advocate login: advocate@caseflow.legal / Advocate@123 | Client login: client@caseflow.legal / Client@123");
    }
}
