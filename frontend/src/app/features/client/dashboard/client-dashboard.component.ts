import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ClientApiService } from '../../../core/services/client-api.service';
import { ClientDashboardModel } from '../../../core/models/caseflow.models';

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatButtonModule],
  template: `
    <div class="cf-page-container" *ngIf="dashboard">
      <div class="cf-page-header">
        <div>
          <h1 class="cf-page-title">Welcome, {{ dashboard.clientName }}</h1>
          <p class="cf-page-subtitle">Your Representing Counsel: <strong>{{ dashboard.advocateName }}</strong> ({{ dashboard.advocateEmail }} • {{ dashboard.advocatePhone }})</p>
        </div>
        <div style="display: flex; gap: 10px;">
          <a mat-flat-button class="cf-btn-primary" routerLink="/client/documents">
            <mat-icon>upload_file</mat-icon> Upload Requested Document
          </a>
        </div>
      </div>

      <!-- Client KPI Cards -->
      <div class="cf-grid-4">
        <div class="cf-stat-card">
          <div>
            <div class="cf-stat-value">{{ dashboard.assignedCasesCount }}</div>
            <div class="cf-stat-label">My Active Cases</div>
          </div>
          <div class="cf-stat-icon badge-blue"><mat-icon>folder_special</mat-icon></div>
        </div>

        <div class="cf-stat-card">
          <div>
            <div class="cf-stat-value">{{ dashboard.upcomingHearingsCount }}</div>
            <div class="cf-stat-label">Upcoming Hearings</div>
          </div>
          <div class="cf-stat-icon badge-mint"><mat-icon>event</mat-icon></div>
        </div>

        <div class="cf-stat-card">
          <div>
            <div class="cf-stat-value">{{ dashboard.requiredDocumentsCount }}</div>
            <div class="cf-stat-label">Documents Required From You</div>
          </div>
          <div class="cf-stat-icon badge-peach"><mat-icon>cloud_upload</mat-icon></div>
        </div>

        <div class="cf-stat-card">
          <div>
            <div class="cf-stat-value">{{ dashboard.pendingRequestsCount }}</div>
            <div class="cf-stat-label">Pending Advocate Requests</div>
          </div>
          <div class="cf-stat-icon badge-lavender"><mat-icon>mark_chat_unread</mat-icon></div>
        </div>
      </div>

      <div class="cf-grid-2">
        <!-- Assigned Cases -->
        <div class="cf-card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <h3 style="margin: 0; font-size: 16px; font-weight: 700;">My Assigned Legal Cases</h3>
            <a routerLink="/client/my-cases" style="font-size: 13px; color: var(--cf-muted-blue); text-decoration: none; font-weight: 600;">View Progress →</a>
          </div>
          <table class="cf-table">
            <thead>
              <tr>
                <th>Case Number & Title</th>
                <th>Court</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let c of dashboard.assignedCases">
                <td>
                  <a [routerLink]="['/client/my-cases', c.id]" style="font-weight: 700; color: var(--cf-navy); text-decoration: none;">{{ c.caseNumber }}</a>
                  <div style="font-size: 12px; color: var(--cf-text-secondary);">{{ c.title }}</div>
                </td>
                <td>{{ c.courtName }}</td>
                <td><span class="cf-badge badge-blue">{{ c.status }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Upcoming Hearings -->
        <div class="cf-card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <h3 style="margin: 0; font-size: 16px; font-weight: 700;">Upcoming Court Hearings</h3>
            <a routerLink="/client/hearings" style="font-size: 13px; color: var(--cf-muted-blue); text-decoration: none; font-weight: 600;">All Hearings →</a>
          </div>
          <table class="cf-table">
            <thead>
              <tr>
                <th>Case</th>
                <th>Date & Time</th>
                <th>Purpose</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let h of dashboard.upcomingHearings">
                <td><strong>{{ h.caseNumber }}</strong></td>
                <td><span class="cf-badge badge-mint">{{ h.hearingDate | date:'dd MMM yyyy, hh:mm a' }}</span></td>
                <td>{{ h.purpose }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Recent Updates & Advocate Requests -->
      <div class="cf-grid-2">
        <div class="cf-card">
          <h3 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 700;">Pending Requests from Your Advocate</h3>
          <div *ngFor="let r of dashboard.pendingRequests" style="padding: 12px 0; border-bottom: 1px solid var(--cf-border);">
            <div style="display: flex; justify-content: space-between;">
              <strong style="color: var(--cf-navy);">{{ r.title }}</strong>
              <span class="cf-badge badge-peach">{{ r.status }}</span>
            </div>
            <p style="font-size: 13px; margin: 4px 0; color: var(--cf-text-secondary);">{{ r.instructions }}</p>
            <div style="font-size: 12px;">Case: {{ r.caseNumber }} • Due: {{ r.dueDate | date:'dd MMM yyyy' }}</div>
          </div>
          <div style="margin-top: 12px;">
            <a mat-stroked-button class="cf-btn-outline" routerLink="/client/requests">Respond to Requests</a>
          </div>
        </div>

        <div class="cf-card">
          <h3 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 700;">Recent Case Progress Updates</h3>
          <div *ngFor="let u of dashboard.recentCaseUpdates" style="padding: 10px 0; border-bottom: 1px solid var(--cf-border);">
            <div style="display: flex; justify-content: space-between;">
              <strong style="color: var(--cf-navy);">{{ u.title }}</strong>
              <span class="cf-badge badge-blue">{{ u.caseNumber }}</span>
            </div>
            <p style="margin: 4px 0; font-size: 13px; color: var(--cf-text-secondary);">{{ u.details }}</p>
            <div style="font-size: 11px; color: #8798AD;">{{ u.createdAt | date:'dd MMM yyyy, hh:mm a' }}</div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ClientDashboardComponent implements OnInit {
  dashboard: ClientDashboardModel | null = null;

  constructor(private clientApi: ClientApiService) {}

  ngOnInit(): void {
    this.clientApi.getDashboard().subscribe(d => (this.dashboard = d));
  }
}
