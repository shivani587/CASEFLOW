package com.caseflow.service;

import com.caseflow.dto.notification.NotificationDto;
import com.caseflow.entity.LegalCase;
import com.caseflow.entity.Notification;
import com.caseflow.entity.User;
import com.caseflow.exception.AccessDeniedOperationException;
import com.caseflow.exception.ResourceNotFoundException;
import com.caseflow.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final SecurityContextService securityContextService;

    @Transactional
    public NotificationDto createAndSendNotification(User recipient, LegalCase legalCase, String type, String title, String message) {
        Notification notification = Notification.builder()
                .recipient(recipient)
                .legalCase(legalCase)
                .type(type)
                .title(title)
                .message(message)
                .read(false)
                .build();

        Notification saved = notificationRepository.save(notification);
        NotificationDto dto = toDto(saved);

        try {
            messagingTemplate.convertAndSend("/topic/notifications/" + recipient.getId(), dto);
        } catch (Exception e) {
            log.warn("WebSocket push failed for user {}: {}", recipient.getId(), e.getMessage());
        }
        return dto;
    }

    @Transactional(readOnly = true)
    public List<NotificationDto> getMyNotifications() {
        User currentUser = securityContextService.getCurrentUser();
        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(currentUser.getId())
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public long getMyUnreadCount() {
        User currentUser = securityContextService.getCurrentUser();
        return notificationRepository.countByRecipientIdAndReadFalse(currentUser.getId());
    }

    @Transactional
    public NotificationDto markAsRead(Long notificationId) {
        User currentUser = securityContextService.getCurrentUser();
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        if (!notification.getRecipient().getId().equals(currentUser.getId())) {
            throw new AccessDeniedOperationException("Cannot modify another user's notification");
        }
        notification.setRead(true);
        return toDto(notificationRepository.save(notification));
    }

    @Transactional
    public void markAllAsRead() {
        User currentUser = securityContextService.getCurrentUser();
        List<Notification> notifications = notificationRepository.findByRecipientIdOrderByCreatedAtDesc(currentUser.getId());
        notifications.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(notifications);
    }

    private NotificationDto toDto(Notification n) {
        return NotificationDto.builder()
                .id(n.getId())
                .recipientUserId(n.getRecipient().getId())
                .caseId(n.getLegalCase() != null ? n.getLegalCase().getId() : null)
                .caseNumber(n.getLegalCase() != null ? n.getLegalCase().getCaseNumber() : null)
                .type(n.getType())
                .title(n.getTitle())
                .message(n.getMessage())
                .read(n.isRead())
                .createdAt(n.getCreatedAt())
                .build();
    }
}
