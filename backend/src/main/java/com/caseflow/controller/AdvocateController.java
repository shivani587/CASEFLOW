package com.caseflow.controller;

import com.caseflow.dto.action.PendingActionDto;
import com.caseflow.dto.casefile.CaseUpdateDto;
import com.caseflow.dto.casefile.LegalCaseDto;
import com.caseflow.dto.client.ClientDto;
import com.caseflow.dto.dashboard.AdvocateDashboardDto;
import com.caseflow.dto.document.DocumentDto;
import com.caseflow.dto.hearing.HearingDto;
import com.caseflow.dto.request.ClientRequestDto;
import com.caseflow.dto.task.TaskDto;
import com.caseflow.entity.User;
import com.caseflow.entity.enums.ClientRequestStatus;
import com.caseflow.entity.enums.DocumentStatus;
import com.caseflow.service.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/advocate")
@RequiredArgsConstructor
public class AdvocateController {

    private final SecurityContextService securityContextService;
    private final DashboardService dashboardService;
    private final ClientService clientService;
    private final LegalCaseService legalCaseService;
    private final HearingService hearingService;
    private final TaskService taskService;
    private final DocumentService documentService;
    private final PendingActionService pendingActionService;
    private final ClientRequestService clientRequestService;

    @GetMapping("/dashboard")
    public ResponseEntity<AdvocateDashboardDto> getDashboard() {
        User advocate = securityContextService.getCurrentAdvocate();
        return ResponseEntity.ok(dashboardService.getAdvocateDashboard(advocate));
    }

    // Clients
    @GetMapping("/clients")
    public ResponseEntity<List<ClientDto>> getClients() {
        return ResponseEntity.ok(clientService.getAdvocateClients());
    }

    @GetMapping("/clients/{id}")
    public ResponseEntity<ClientDto> getClient(@PathVariable Long id) {
        return ResponseEntity.ok(clientService.getClientById(id));
    }

    @PostMapping("/clients")
    public ResponseEntity<ClientDto> createClient(@Valid @RequestBody ClientDto dto) {
        return ResponseEntity.ok(clientService.createClient(dto));
    }

    @PutMapping("/clients/{id}")
    public ResponseEntity<ClientDto> updateClient(@PathVariable Long id, @Valid @RequestBody ClientDto dto) {
        return ResponseEntity.ok(clientService.updateClient(id, dto));
    }

    // Cases
    @GetMapping("/cases")
    public ResponseEntity<List<LegalCaseDto>> getCases() {
        return ResponseEntity.ok(legalCaseService.getAdvocateCases());
    }

    @GetMapping("/cases/{id}")
    public ResponseEntity<LegalCaseDto> getCaseById(@PathVariable Long id) {
        return ResponseEntity.ok(legalCaseService.getCaseById(id));
    }

    @PostMapping("/cases")
    public ResponseEntity<LegalCaseDto> createCase(@Valid @RequestBody LegalCaseDto dto) {
        return ResponseEntity.ok(legalCaseService.createCase(dto));
    }

    @PutMapping("/cases/{id}")
    public ResponseEntity<LegalCaseDto> updateCase(@PathVariable Long id, @Valid @RequestBody LegalCaseDto dto) {
        return ResponseEntity.ok(legalCaseService.updateCase(id, dto));
    }

    @GetMapping("/cases/{id}/updates")
    public ResponseEntity<List<CaseUpdateDto>> getCaseUpdates(@PathVariable Long id) {
        return ResponseEntity.ok(legalCaseService.getCaseUpdates(id));
    }

    @PostMapping("/cases/updates")
    public ResponseEntity<CaseUpdateDto> addCaseUpdate(@Valid @RequestBody CaseUpdateDto dto) {
        return ResponseEntity.ok(legalCaseService.addCaseUpdate(dto));
    }

    // Hearings
    @GetMapping("/hearings")
    public ResponseEntity<List<HearingDto>> getHearings() {
        return ResponseEntity.ok(hearingService.getAdvocateHearings());
    }

    @GetMapping("/cases/{caseId}/hearings")
    public ResponseEntity<List<HearingDto>> getHearingsByCase(@PathVariable Long caseId) {
        return ResponseEntity.ok(hearingService.getHearingsByCase(caseId));
    }

    @PostMapping("/hearings")
    public ResponseEntity<HearingDto> createHearing(@Valid @RequestBody HearingDto dto) {
        return ResponseEntity.ok(hearingService.createHearing(dto));
    }

    @PutMapping("/hearings/{id}")
    public ResponseEntity<HearingDto> updateHearing(@PathVariable Long id, @Valid @RequestBody HearingDto dto) {
        return ResponseEntity.ok(hearingService.updateHearing(id, dto));
    }

    // Tasks
    @GetMapping("/tasks")
    public ResponseEntity<List<TaskDto>> getTasks() {
        return ResponseEntity.ok(taskService.getAdvocateTasks());
    }

    @GetMapping("/cases/{caseId}/tasks")
    public ResponseEntity<List<TaskDto>> getTasksByCase(@PathVariable Long caseId) {
        return ResponseEntity.ok(taskService.getTasksByCase(caseId));
    }

    @PostMapping("/tasks")
    public ResponseEntity<TaskDto> createTask(@Valid @RequestBody TaskDto dto) {
        return ResponseEntity.ok(taskService.createTask(dto));
    }

    @PutMapping("/tasks/{id}")
    public ResponseEntity<TaskDto> updateTask(@PathVariable Long id, @Valid @RequestBody TaskDto dto) {
        return ResponseEntity.ok(taskService.updateTask(id, dto));
    }

    @DeleteMapping("/tasks/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }

    // Documents
    @GetMapping("/documents")
    public ResponseEntity<List<DocumentDto>> getDocuments() {
        return ResponseEntity.ok(documentService.getAdvocateDocuments());
    }

    @PostMapping("/documents/request")
    public ResponseEntity<DocumentDto> requestDocument(@Valid @RequestBody DocumentDto dto) {
        return ResponseEntity.ok(documentService.requestRequiredDocument(dto));
    }

    @PatchMapping("/documents/{id}/verify")
    public ResponseEntity<DocumentDto> verifyDocument(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        DocumentStatus status = DocumentStatus.valueOf(body.getOrDefault("status", "VERIFIED"));
        String remarks = body.get("remarks");
        return ResponseEntity.ok(documentService.verifyOrRejectDocument(id, status, remarks));
    }

    // Pending Actions
    @GetMapping("/pending-actions")
    public ResponseEntity<List<PendingActionDto>> getPendingActions() {
        return ResponseEntity.ok(pendingActionService.getAdvocatePendingActions());
    }

    @GetMapping("/cases/{caseId}/pending-actions")
    public ResponseEntity<List<PendingActionDto>> getPendingActionsByCase(@PathVariable Long caseId) {
        return ResponseEntity.ok(pendingActionService.getPendingActionsByCase(caseId));
    }

    @PostMapping("/pending-actions")
    public ResponseEntity<PendingActionDto> createPendingAction(@Valid @RequestBody PendingActionDto dto) {
        return ResponseEntity.ok(pendingActionService.createPendingAction(dto));
    }

    @PutMapping("/pending-actions/{id}")
    public ResponseEntity<PendingActionDto> updatePendingAction(@PathVariable Long id, @Valid @RequestBody PendingActionDto dto) {
        return ResponseEntity.ok(pendingActionService.updatePendingAction(id, dto));
    }

    // Client Requests
    @GetMapping("/client-requests")
    public ResponseEntity<List<ClientRequestDto>> getClientRequests() {
        return ResponseEntity.ok(clientRequestService.getAdvocateRequests());
    }

    @PostMapping("/client-requests")
    public ResponseEntity<ClientRequestDto> createClientRequest(@Valid @RequestBody ClientRequestDto dto) {
        return ResponseEntity.ok(clientRequestService.createClientRequest(dto));
    }

    @PatchMapping("/client-requests/{id}/review")
    public ResponseEntity<ClientRequestDto> reviewClientRequest(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        ClientRequestStatus status = ClientRequestStatus.valueOf(body.getOrDefault("status", "APPROVED"));
        String notes = body.get("reviewNotes");
        return ResponseEntity.ok(clientRequestService.reviewClientResponse(id, status, notes));
    }
}
