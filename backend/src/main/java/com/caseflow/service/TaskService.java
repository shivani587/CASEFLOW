package com.caseflow.service;

import com.caseflow.dto.task.TaskDto;
import com.caseflow.entity.LegalCase;
import com.caseflow.entity.Task;
import com.caseflow.entity.User;
import com.caseflow.entity.enums.TaskStatus;
import com.caseflow.exception.AccessDeniedOperationException;
import com.caseflow.exception.ResourceNotFoundException;
import com.caseflow.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final LegalCaseService legalCaseService;
    private final SecurityContextService securityContextService;

    @Transactional(readOnly = true)
    public List<TaskDto> getAdvocateTasks() {
        User advocate = securityContextService.getCurrentAdvocate();
        return taskRepository.findByAssignedAdvocateIdOrderByDueDateAsc(advocate.getId())
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TaskDto> getTasksByCase(Long caseId) {
        LegalCase legalCase = legalCaseService.getAuthorizedCase(caseId);
        return taskRepository.findByLegalCaseIdOrderByDueDateAsc(legalCase.getId())
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    @CacheEvict(value = "advocateDashboard", allEntries = true)
    public TaskDto createTask(TaskDto dto) {
        User advocate = securityContextService.getCurrentAdvocate();
        LegalCase legalCase = legalCaseService.getAuthorizedCase(dto.getCaseId());

        Task task = Task.builder()
                .legalCase(legalCase)
                .assignedAdvocate(advocate)
                .title(dto.getTitle().trim())
                .description(dto.getDescription())
                .priority(dto.getPriority())
                .status(dto.getStatus() != null ? dto.getStatus() : TaskStatus.PENDING)
                .dueDate(dto.getDueDate())
                .overdueAlertSent(false)
                .build();

        return toDto(taskRepository.save(task));
    }

    @Transactional
    @CacheEvict(value = "advocateDashboard", allEntries = true)
    public TaskDto updateTask(Long taskId, TaskDto dto) {
        User advocate = securityContextService.getCurrentAdvocate();
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));
        if (!task.getAssignedAdvocate().getId().equals(advocate.getId())) {
            throw new AccessDeniedOperationException("Not authorized to update this task");
        }

        task.setTitle(dto.getTitle().trim());
        task.setDescription(dto.getDescription());
        task.setPriority(dto.getPriority());
        task.setStatus(dto.getStatus());
        task.setDueDate(dto.getDueDate());
        if (dto.getStatus() == TaskStatus.COMPLETED && task.getCompletedAt() == null) {
            task.setCompletedAt(LocalDateTime.now());
        } else if (dto.getStatus() != TaskStatus.COMPLETED) {
            task.setCompletedAt(null);
        }

        return toDto(taskRepository.save(task));
    }

    @Transactional
    @CacheEvict(value = "advocateDashboard", allEntries = true)
    public void deleteTask(Long taskId) {
        User advocate = securityContextService.getCurrentAdvocate();
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));
        if (!task.getAssignedAdvocate().getId().equals(advocate.getId())) {
            throw new AccessDeniedOperationException("Not authorized to delete this task");
        }
        taskRepository.delete(task);
    }

    public TaskDto toDto(Task t) {
        boolean overdue = t.getStatus() != TaskStatus.COMPLETED && t.getDueDate().isBefore(LocalDate.now());
        return TaskDto.builder()
                .id(t.getId())
                .caseId(t.getLegalCase().getId())
                .caseNumber(t.getLegalCase().getCaseNumber())
                .caseTitle(t.getLegalCase().getTitle())
                .assignedAdvocateId(t.getAssignedAdvocate().getId())
                .assignedAdvocateName(t.getAssignedAdvocate().getFullName())
                .title(t.getTitle())
                .description(t.getDescription())
                .priority(t.getPriority())
                .status(overdue ? TaskStatus.OVERDUE : t.getStatus())
                .dueDate(t.getDueDate())
                .overdue(overdue)
                .completedAt(t.getCompletedAt())
                .createdAt(t.getCreatedAt())
                .updatedAt(t.getUpdatedAt())
                .build();
    }
}
