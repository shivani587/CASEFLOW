import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CaseUpdateModel,
  ClientDashboardModel,
  ClientRequestModel,
  DocumentModel,
  HearingModel,
  LegalCaseModel
} from '../models/caseflow.models';

@Injectable({ providedIn: 'root' })
export class ClientApiService {
  private readonly base = `${environment.apiUrl}/client`;

  constructor(private http: HttpClient) {}

  getDashboard(): Observable<ClientDashboardModel> {
    return this.http.get<ClientDashboardModel>(`${this.base}/dashboard`);
  }

  getMyCases(): Observable<LegalCaseModel[]> {
    return this.http.get<LegalCaseModel[]>(`${this.base}/cases`);
  }

  getCaseDetails(id: number): Observable<LegalCaseModel> {
    return this.http.get<LegalCaseModel>(`${this.base}/cases/${id}`);
  }

  getCaseUpdates(id: number): Observable<CaseUpdateModel[]> {
    return this.http.get<CaseUpdateModel[]>(`${this.base}/cases/${id}/updates`);
  }

  getMyHearings(): Observable<HearingModel[]> {
    return this.http.get<HearingModel[]>(`${this.base}/hearings`);
  }

  getMyDocuments(): Observable<DocumentModel[]> {
    return this.http.get<DocumentModel[]>(`${this.base}/documents`);
  }

  getMyRequests(): Observable<ClientRequestModel[]> {
    return this.http.get<ClientRequestModel[]>(`${this.base}/requests`);
  }

  submitResponse(requestId: number, response: string): Observable<ClientRequestModel> {
    return this.http.post<ClientRequestModel>(`${this.base}/requests/${requestId}/respond`, { response });
  }
}
