import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AdvocateDashboardModel,
  CaseUpdateModel,
  ClientModel,
  ClientRequestModel,
  ClientRequestStatus,
  DocumentModel,
  DocumentStatus,
  HearingModel,
  LegalCaseModel,
  PendingActionModel,
  TaskModel
} from '../models/caseflow.models';

@Injectable({ providedIn: 'root' })
export class AdvocateApiService {
  private readonly base = `${environment.apiUrl}/advocate`;

  constructor(private http: HttpClient) {}

  getDashboard(): Observable<AdvocateDashboardModel> {
    return this.http.get<AdvocateDashboardModel>(`${this.base}/dashboard`);
  }

  // Clients
  getClients(): Observable<ClientModel[]> {
    return this.http.get<ClientModel[]>(`${this.base}/clients`);
  }

  createClient(client: ClientModel): Observable<ClientModel> {
    return this.http.post<ClientModel>(`${this.base}/clients`, client);
  }

  updateClient(id: number, client: ClientModel): Observable<ClientModel> {
    return this.http.put<ClientModel>(`${this.base}/clients/${id}`, client);
  }

  // Cases
  getCases(): Observable<LegalCaseModel[]> {
    return this.http.get<LegalCaseModel[]>(`${this.base}/cases`);
  }

  getCaseById(id: number): Observable<LegalCaseModel> {
    return this.http.get<LegalCaseModel>(`${this.base}/cases/${id}`);
  }

  createCase(legalCase: LegalCaseModel): Observable<LegalCaseModel> {
    return this.http.post<LegalCaseModel>(`${this.base}/cases`, legalCase);
  }

  updateCase(id: number, legalCase: LegalCaseModel): Observable<LegalCaseModel> {
    return this.http.put<LegalCaseModel>(`${this.base}/cases/${id}`, legalCase);
  }

  getCaseUpdates(caseId: number): Observable<CaseUpdateModel[]> {
    return this.http.get<CaseUpdateModel[]>(`${this.base}/cases/${caseId}/updates`);
  }

  addCaseUpdate(update: CaseUpdateModel): Observable<CaseUpdateModel> {
    return this.http.post<CaseUpdateModel>(`${this.base}/cases/updates`, update);
  }

  // Hearings
  getHearings(): Observable<HearingModel[]> {
    return this.http.get<HearingModel[]>(`${this.base}/hearings`);
  }

  getHearingsByCase(caseId: number): Observable<HearingModel[]> {
    return this.http.get<HearingModel[]>(`${this.base}/cases/${caseId}/hearings`);
  }

  createHearing(hearing: HearingModel): Observable<HearingModel> {
    return this.http.post<HearingModel>(`${this.base}/hearings`, hearing);
  }

  updateHearing(id: number, hearing: HearingModel): Observable<HearingModel> {
    return this.http.put<HearingModel>(`${this.base}/hearings/${id}`, hearing);
  }

  // Tasks
  getTasks(): Observable<TaskModel[]> {
    return this.http.get<TaskModel[]>(`${this.base}/tasks`);
  }

  getTasksByCase(caseId: number): Observable<TaskModel[]> {
    return this.http.get<TaskModel[]>(`${this.base}/cases/${caseId}/tasks`);
  }

  createTask(task: TaskModel): Observable<TaskModel> {
    return this.http.post<TaskModel>(`${this.base}/tasks`, task);
  }

  updateTask(id: number, task: TaskModel): Observable<TaskModel> {
    return this.http.put<TaskModel>(`${this.base}/tasks/${id}`, task);
  }

  deleteTask(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/tasks/${id}`);
  }

  // Documents
  getDocuments(): Observable<DocumentModel[]> {
    return this.http.get<DocumentModel[]>(`${this.base}/documents`);
  }

  requestRequiredDocument(doc: DocumentModel): Observable<DocumentModel> {
    return this.http.post<DocumentModel>(`${this.base}/documents/request`, doc);
  }

  verifyOrRejectDocument(id: number, status: DocumentStatus, remarks: string): Observable<DocumentModel> {
    return this.http.patch<DocumentModel>(`${this.base}/documents/${id}/verify`, { status, remarks });
  }

  // Pending Actions
  getPendingActions(): Observable<PendingActionModel[]> {
    return this.http.get<PendingActionModel[]>(`${this.base}/pending-actions`);
  }

  getPendingActionsByCase(caseId: number): Observable<PendingActionModel[]> {
    return this.http.get<PendingActionModel[]>(`${this.base}/cases/${caseId}/pending-actions`);
  }

  createPendingAction(action: PendingActionModel): Observable<PendingActionModel> {
    return this.http.post<PendingActionModel>(`${this.base}/pending-actions`, action);
  }

  updatePendingAction(id: number, action: PendingActionModel): Observable<PendingActionModel> {
    return this.http.put<PendingActionModel>(`${this.base}/pending-actions/${id}`, action);
  }

  // Client Requests
  getClientRequests(): Observable<ClientRequestModel[]> {
    return this.http.get<ClientRequestModel[]>(`${this.base}/client-requests`);
  }

  createClientRequest(req: ClientRequestModel): Observable<ClientRequestModel> {
    return this.http.post<ClientRequestModel>(`${this.base}/client-requests`, req);
  }

  reviewClientRequest(id: number, status: ClientRequestStatus, reviewNotes: string): Observable<ClientRequestModel> {
    return this.http.patch<ClientRequestModel>(`${this.base}/client-requests/${id}/review`, { status, reviewNotes });
  }
}
