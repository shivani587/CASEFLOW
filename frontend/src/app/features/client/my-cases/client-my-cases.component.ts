import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { ClientApiService } from '../../../core/services/client-api.service';
import { LegalCaseModel } from '../../../core/models/caseflow.models';

@Component({
  selector: 'app-client-my-cases',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule],
  template: `
    <div class="cf-page-container">
      <div class="cf-page-header">
        <div>
          <h1 class="cf-page-title">My Assigned Legal Cases</h1>
          <p class="cf-page-subtitle">View complete details, court particulars, and live status of your assigned cases.</p>
        </div>
      </div>

      <div class="cf-grid-2">
        <div class="cf-card" *ngFor="let c of cases">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <span class="cf-badge badge-blue">{{ c.caseNumber }}</span>
            <span class="cf-badge badge-mint">{{ c.status }}</span>
          </div>
          <h3 style="margin: 0 0 8px 0; font-size: 18px;">{{ c.title }}</h3>
          <p style="font-size: 13px; color: var(--cf-text-secondary); margin-bottom: 14px;">{{ c.description }}</p>

          <div style="font-size: 13px; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; background: #F8FAFE; padding: 12px; border-radius: 8px; margin-bottom: 14px;">
            <div><strong>Court:</strong> {{ c.courtName }}</div>
            <div><strong>Bench:</strong> {{ c.courtHall }}</div>
            <div><strong>Judge:</strong> {{ c.judgeName }}</div>
            <div><strong>Advocate:</strong> {{ c.advocateName }}</div>
            <div><strong>Next Hearing:</strong> {{ (c.nextHearingDate | date:'dd MMM yyyy') || 'To be listed' }}</div>
            <div><strong>Next Deadline:</strong> {{ c.nextDeadline | date:'dd MMM yyyy' }}</div>
          </div>

          <a mat-flat-button class="cf-btn-primary" [routerLink]="['/client/my-cases', c.id]">View Case Timeline & Progress</a>
        </div>
      </div>
    </div>
  `
})
export class ClientMyCasesComponent implements OnInit {
  cases: LegalCaseModel[] = [];

  constructor(private clientApi: ClientApiService) {}

  ngOnInit(): void {
    this.clientApi.getMyCases().subscribe(list => (this.cases = list));
  }
}
