package com.caseflow.controller;

import com.caseflow.dto.casefile.CaseUpdateDto;
import com.caseflow.dto.casefile.LegalCaseDto;
import com.caseflow.dto.dashboard.ClientDashboardDto;
import com.caseflow.dto.document.DocumentDto;
import com.caseflow.dto.hearing.HearingDto;
import com.caseflow.dto.request.ClientRequestDto;
import com.caseflow.entity.Client;
import com.caseflow.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/client")
@RequiredArgsConstructor
public class ClientPortalController {

    private final SecurityContextService securityContextService;
    private final DashboardService dashboardService;
    private final LegalCaseService legalCaseService;
    private final HearingService hearingService;
    private final DocumentService documentService;
    private final ClientRequestService clientRequestService;

    @GetMapping("/dashboard")
    public ResponseEntity<ClientDashboardDto> getDashboard() {
        Client client = securityContextService.getCurrentClientProfile();
        return ResponseEntity.ok(dashboardService.getClientDashboard(client));
    }

    @GetMapping("/cases")
    public ResponseEntity<List<LegalCaseDto>> getMyCases() {
        return ResponseEntity.ok(legalCaseService.getClientCases());
    }

    @GetMapping("/cases/{id}")
    public ResponseEntity<LegalCaseDto> getCaseDetails(@PathVariable Long id) {
        return ResponseEntity.ok(legalCaseService.getCaseById(id));
    }

    @GetMapping("/cases/{id}/updates")
    public ResponseEntity<List<CaseUpdateDto>> getCaseUpdates(@PathVariable Long id) {
        return ResponseEntity.ok(legalCaseService.getCaseUpdates(id));
    }

    @GetMapping("/hearings")
    public ResponseEntity<List<HearingDto>> getMyHearings() {
        return ResponseEntity.ok(hearingService.getClientHearings());
    }

    @GetMapping("/documents")
    public ResponseEntity<List<DocumentDto>> getMyDocuments() {
        return ResponseEntity.ok(documentService.getClientDocuments());
    }

    @GetMapping("/requests")
    public ResponseEntity<List<ClientRequestDto>> getMyRequests() {
        return ResponseEntity.ok(clientRequestService.getClientRequests());
    }

    @PostMapping("/requests/{id}/respond")
    public ResponseEntity<ClientRequestDto> submitResponse(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(clientRequestService.submitClientResponse(id, body.get("response")));
    }
}
