import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ClientApiService } from '../../../core/services/client-api.service';
import { CaseUpdateModel, LegalCaseModel } from '../../../core/models/caseflow.models';

@Component({
  selector: 'app-client-case-progress',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="cf-page-container" *ngIf="legalCase">
      <div class="cf-page-header">
        <div>
          <a routerLink="/client/my-cases" style="font-size: 13px; color: var(--cf-muted-blue); text-decoration: none; font-weight: 600;">← Back to My Cases</a>
          <h1 class="cf-page-title">{{ legalCase.caseNumber }} — {{ legalCase.title }}</h1>
          <p class="cf-page-subtitle">{{ legalCase.courtName }} ({{ legalCase.courtHall }}) • Status: {{ legalCase.status }}</p>
        </div>
      </div>

      <div class="cf-card">
        <h3 style="margin-top: 0;">Case Progress & Milestone History</h3>
        <div *ngFor="let u of updates" style="padding: 14px 0; border-bottom: 1px solid var(--cf-border);">
          <div style="display: flex; justify-content: space-between;">
            <strong style="color: var(--cf-navy); font-size: 15px;">{{ u.title }}</strong>
            <span class="cf-badge badge-blue">{{ u.updateType }}</span>
          </div>
          <p style="margin: 6px 0; font-size: 14px;">{{ u.details }}</p>
          <div style="font-size: 12px; color: var(--cf-text-secondary);">{{ u.createdAt | date:'dd MMM yyyy, hh:mm a' }} • {{ u.authorName }}</div>
        </div>
      </div>
    </div>
  `
})
export class ClientCaseProgressComponent implements OnInit {
  legalCase: LegalCaseModel | null = null;
  updates: CaseUpdateModel[] = [];

  constructor(private route: ActivatedRoute, private clientApi: ClientApiService) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.clientApi.getCaseDetails(id).subscribe(c => (this.legalCase = c));
    this.clientApi.getCaseUpdates(id).subscribe(u => (this.updates = u));
  }
}
