package com.caseflow.service;

import com.caseflow.dto.document.DocumentDto;
import com.caseflow.entity.Client;
import com.caseflow.entity.Document;
import com.caseflow.entity.LegalCase;
import com.caseflow.entity.User;
import com.caseflow.entity.enums.DocumentStatus;
import com.caseflow.entity.enums.Role;
import com.caseflow.exception.AccessDeniedOperationException;
import com.caseflow.exception.BadRequestException;
import com.caseflow.exception.ResourceNotFoundException;
import com.caseflow.repository.DocumentRepository;
import io.minio.BucketExistsArgs;
import io.minio.GetObjectArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final LegalCaseService legalCaseService;
    private final SecurityContextService securityContextService;
    private final NotificationService notificationService;
    private final MinioClient minioClient;

    @Value("${caseflow.minio.bucket}")
    private String bucketName;

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "application/pdf",
            "image/png",
            "image/jpeg",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "text/plain"
    );

    private static final long MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024L;

    @Transactional(readOnly = true)
    public List<DocumentDto> getAdvocateDocuments() {
        User advocate = securityContextService.getCurrentAdvocate();
        return documentRepository.findByLegalCaseAdvocateIdOrderByUpdatedAtDesc(advocate.getId())
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<DocumentDto> getClientDocuments() {
        Client client = securityContextService.getCurrentClientProfile();
        return documentRepository.findByLegalCaseClientIdOrderByUpdatedAtDesc(client.getId())
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<DocumentDto> getDocumentsByCase(Long caseId) {
        LegalCase legalCase = legalCaseService.getAuthorizedCase(caseId);
        return documentRepository.findByLegalCaseIdOrderByUpdatedAtDesc(legalCase.getId())
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    @CacheEvict(value = {"advocateDashboard", "clientDashboard"}, allEntries = true)
    public DocumentDto requestRequiredDocument(DocumentDto dto) {
        User advocate = securityContextService.getCurrentAdvocate();
        LegalCase legalCase = legalCaseService.getAuthorizedCase(dto.getCaseId());

        Document document = Document.builder()
                .legalCase(legalCase)
                .client(legalCase.getClient())
                .title(dto.getTitle().trim())
                .category(dto.getCategory())
                .description(dto.getDescription())
                .status(DocumentStatus.REQUIRED)
                .dueDate(dto.getDueDate())
                .build();

        Document saved = documentRepository.save(document);

        if (legalCase.getClient().getUserAccount() != null) {
            notificationService.createAndSendNotification(
                    legalCase.getClient().getUserAccount(),
                    legalCase,
                    "DOCUMENT_REQUEST",
                    "Document Required: " + saved.getTitle(),
                    "Your advocate requested document '" + saved.getTitle() + "' for case " + legalCase.getCaseNumber() + "."
            );
        }

        return toDto(saved);
    }

    @Transactional
    @CacheEvict(value = {"advocateDashboard", "clientDashboard"}, allEntries = true)
    public DocumentDto uploadDocument(Long documentId, Long caseId, String title, String category, String description, MultipartFile file) {
        validateFile(file);
        User currentUser = securityContextService.getCurrentUser();
        LegalCase legalCase = legalCaseService.getAuthorizedCase(caseId);

        Document document;
        if (documentId != null) {
            document = documentRepository.findById(documentId)
                    .orElseThrow(() -> new ResourceNotFoundException("Document record not found"));
            if (!document.getLegalCase().getId().equals(legalCase.getId())) {
                throw new BadRequestException("Document does not belong to the specified case");
            }
        } else {
            document = Document.builder()
                    .legalCase(legalCase)
                    .client(legalCase.getClient())
                    .title(title != null ? title.trim() : file.getOriginalFilename())
                    .category(category != null ? category : "Legal Filing")
                    .description(description)
                    .build();
        }

        String sanitizedFilename = file.getOriginalFilename() != null
                ? file.getOriginalFilename().replaceAll("[^a-zA-Z0-9._-]", "_")
                : "document.pdf";
        String objectKey = "cases/" + legalCase.getId() + "/" + UUID.randomUUID() + "_" + sanitizedFilename;

        try {
            boolean exists = minioClient.bucketExists(BucketExistsArgs.builder().bucket(bucketName).build());
            if (!exists) {
                minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucketName).build());
            }
            try (InputStream is = file.getInputStream()) {
                minioClient.putObject(
                        PutObjectArgs.builder()
                                .bucket(bucketName)
                                .object(objectKey)
                                .stream(is, file.getSize(), -1)
                                .contentType(file.getContentType())
                                .build()
                );
            }
        } catch (Exception e) {
            log.error("MinIO upload failed: {}", e.getMessage());
            throw new BadRequestException("Failed to store document in MinIO object storage: " + e.getMessage());
        }

        document.setFileName(sanitizedFilename);
        document.setContentType(file.getContentType());
        document.setFileSize(file.getSize());
        document.setMinioObjectKey(objectKey);
        document.setUploadedBy(currentUser);
        document.setUploadedAt(LocalDateTime.now());

        if (currentUser.getRole() == Role.ADVOCATE) {
            document.setStatus(DocumentStatus.VERIFIED);
            document.setVerifiedAt(LocalDateTime.now());
            document.setVerificationRemarks("Uploaded and verified by Advocate");
        } else {
            document.setStatus(DocumentStatus.AWAITING_VERIFICATION);
            document.setVerificationRemarks("Submitted by client, awaiting advocate verification");
        }

        Document saved = documentRepository.save(document);

        if (currentUser.getRole() == Role.CLIENT) {
            notificationService.createAndSendNotification(
                    legalCase.getAdvocate(),
                    legalCase,
                    "DOCUMENT_SUBMISSION",
                    "Document Uploaded by Client: " + saved.getTitle(),
                    "Client " + currentUser.getFullName() + " uploaded '" + saved.getFileName() + "' for verification."
            );
        } else if (legalCase.getClient().getUserAccount() != null) {
            notificationService.createAndSendNotification(
                    legalCase.getClient().getUserAccount(),
                    legalCase,
                    "DOCUMENT_VERIFIED",
                    "New Case Document Added: " + saved.getTitle(),
                    "Advocate " + currentUser.getFullName() + " uploaded '" + saved.getTitle() + "' to case " + legalCase.getCaseNumber() + "."
            );
        }

        return toDto(saved);
    }

    @Transactional
    @CacheEvict(value = {"advocateDashboard", "clientDashboard"}, allEntries = true)
    public DocumentDto verifyOrRejectDocument(Long documentId, DocumentStatus decision, String remarks) {
        User advocate = securityContextService.getCurrentAdvocate();
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found"));
        if (!document.getLegalCase().getAdvocate().getId().equals(advocate.getId())) {
            throw new AccessDeniedOperationException("Not authorized to verify this document");
        }
        if (decision != DocumentStatus.VERIFIED && decision != DocumentStatus.REJECTED) {
            throw new BadRequestException("Verification decision must be VERIFIED or REJECTED");
        }

        document.setStatus(decision);
        document.setVerificationRemarks(remarks);
        document.setVerifiedAt(LocalDateTime.now());

        Document saved = documentRepository.save(document);

        legalCaseService.recordCaseUpdateInternal(
                document.getLegalCase(),
                advocate,
                "DOCUMENT_" + decision.name(),
                "Document " + decision.name() + ": " + saved.getTitle(),
                remarks != null ? remarks : "Document status updated to " + decision.name(),
                true
        );

        if (document.getLegalCase().getClient().getUserAccount() != null) {
            notificationService.createAndSendNotification(
                    document.getLegalCase().getClient().getUserAccount(),
                    document.getLegalCase(),
                    "DOCUMENT_" + decision.name(),
                    "Document " + decision.name() + ": " + saved.getTitle(),
                    "Your submitted document '" + saved.getTitle() + "' was marked as " + decision.name() +
                            (remarks != null ? ". Remarks: " + remarks : ".")
            );
        }

        return toDto(saved);
    }

    @Transactional(readOnly = true)
    public Document getAuthorizedDocumentEntity(Long documentId) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found"));
        legalCaseService.getAuthorizedCase(document.getLegalCase().getId());
        if (document.getMinioObjectKey() == null) {
            throw new BadRequestException("No file has been uploaded for this document requirement yet");
        }
        return document;
    }

    public Resource downloadDocumentResource(Document document) {
        try {
            InputStream stream = minioClient.getObject(
                    GetObjectArgs.builder()
                            .bucket(bucketName)
                            .object(document.getMinioObjectKey())
                            .build()
            );
            return new InputStreamResource(stream);
        } catch (Exception e) {
            throw new BadRequestException("Could not retrieve file from MinIO storage: " + e.getMessage());
        }
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Uploaded file cannot be empty");
        }
        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new BadRequestException("File exceeds maximum permitted size of 25 MB");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType)) {
            throw new BadRequestException("Unsupported file type. Allowed formats: PDF, PNG, JPG, DOC, DOCX, TXT");
        }
    }

    public DocumentDto toDto(Document d) {
        return DocumentDto.builder()
                .id(d.getId())
                .caseId(d.getLegalCase().getId())
                .caseNumber(d.getLegalCase().getCaseNumber())
                .caseTitle(d.getLegalCase().getTitle())
                .clientId(d.getClient() != null ? d.getClient().getId() : null)
                .clientName(d.getClient() != null ? d.getClient().getFullName() : null)
                .uploadedByUserId(d.getUploadedBy() != null ? d.getUploadedBy().getId() : null)
                .uploadedByName(d.getUploadedBy() != null ? d.getUploadedBy().getFullName() : null)
                .title(d.getTitle())
                .category(d.getCategory())
                .description(d.getDescription())
                .fileName(d.getFileName())
                .contentType(d.getContentType())
                .fileSize(d.getFileSize())
                .status(d.getStatus())
                .verificationRemarks(d.getVerificationRemarks())
                .dueDate(d.getDueDate())
                .uploadedAt(d.getUploadedAt())
                .verifiedAt(d.getVerifiedAt())
                .createdAt(d.getCreatedAt())
                .updatedAt(d.getUpdatedAt())
                .build();
    }
}
