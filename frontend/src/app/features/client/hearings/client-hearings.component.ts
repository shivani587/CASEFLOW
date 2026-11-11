import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientApiService } from '../../../core/services/client-api.service';
import { HearingModel } from '../../../core/models/caseflow.models';

@Component({
  selector: 'app-client-hearings',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="cf-page-container">
      <div class="cf-page-header">
        <div>
          <h1 class="cf-page-title">My Court Hearings Schedule</h1>
          <p class="cf-page-subtitle">Track upcoming and past court hearings across your assigned cases.</p>
        </div>
      </div>

      <div class="cf-card">
        <table class="cf-table">
          <thead>
            <tr>
              <th>Hearing Date & Time</th>
              <th>Case Number & Title</th>
              <th>Court & Bench</th>
              <th>Purpose</th>
              <th>Status</th>
              <th>Outcome & Notes</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let h of hearings">
              <td><span class="cf-badge badge-blue">{{ h.hearingDate | date:'dd MMM yyyy, hh:mm a' }}</span></td>
              <td>
                <div style="font-weight: 700; color: var(--cf-navy);">{{ h.caseNumber }}</div>
                <div style="font-size: 12px; color: var(--cf-text-secondary);">{{ h.caseTitle }}</div>
              </td>
              <td>{{ h.courtName }} ({{ h.courtRoom }})</td>
              <td>{{ h.purpose }}</td>
              <td><span class="cf-badge badge-mint">{{ h.status }}</span></td>
              <td>{{ h.outcomeNotes }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class ClientHearingsComponent implements OnInit {
  hearings: HearingModel[] = [];

  constructor(private clientApi: ClientApiService) {}

  ngOnInit(): void {
    this.clientApi.getMyHearings().subscribe(list => (this.hearings = list));
  }
}
