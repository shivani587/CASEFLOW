import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AdvocateApiService } from '../../../core/services/advocate-api.service';
import { AdvocateDashboardModel } from '../../../core/models/caseflow.models';

@Component({
  selector: 'app-advocate-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatButtonModule],
  template: `
    <div class="cf-page-container" *ngIf="dashboard">
      <div class="cf-page-header">
        <div>
          <h1 class="cf-page-title">Advocate Action Command Center</h1>
          <p class="cf-page-subtitle">Real-time overview of hearings, urgent tasks, missing documents, and client follow-ups requiring immediate attention.</p>
        </div>
        <div style="display: flex; gap: 10px;">
          <a mat-flat-button class="cf-btn-primary" routerLink="/advocate/cases">
            <mat-icon>add</mat-icon> New Legal Case
          </a>
          <button mat-stroked-button class="cf-btn-outline" (click)="loadDashboard()">
            <mat-icon>refresh</mat-icon> Refresh
          </button>
        </div>
      </div>

      <!-- KPI Row 1 -->
      <div class="cf-grid-4">
        <div class="cf-stat-card">
          <div>
            <div class="cf-stat-value">{{ dashboard.totalCases }}</div>
            <div class="cf-stat-label">Total Cases ({{ dashboard.activeCases }} Active)</div>
          </div>
          <div class="cf-stat-icon badge-blue"><mat-icon>gavel</mat-icon></div>
        </div>

        <div class="cf-stat-card">
          <div>
            <div class="cf-stat-value">{{ dashboard.totalClients }}</div>
            <div class="cf-stat-label">Registered Clients</div>
          </div>
          <div class="cf-stat-icon badge-lavender"><mat-icon>groups</mat-icon></div>
        </div>

        <div class="cf-stat-card">
          <div>
            <div class="cf-stat-value">{{ dashboard.upcomingHearingsCount }}</div>
            <div class="cf-stat-label">Upcoming Hearings</div>
          </div>
          <div class="cf-stat-icon badge-mint"><mat-icon>event_available</mat-icon></div>
        </div>

        <div class="cf-stat-card">
          <div>
            <div class="cf-stat-value">{{ dashboard.urgentTasksCount }}</div>
            <div class="cf-stat-label">Urgent Tasks ({{ dashboard.overdueTasksCount }} Overdue)</div>
          </div>
          <div class="cf-stat-icon badge-blush"><mat-icon>priority_high</mat-icon></div>
        </div>
      </div>

      <!-- KPI Row 2 -->
      <div class="cf-grid-4">
        <div class="cf-stat-card">
          <div>
            <div class="cf-stat-value">{{ dashboard.missingDocumentsCount }}</div>
            <div class="cf-stat-label">Missing / Required Documents</div>
          </div>
          <div class="cf-stat-icon badge-peach"><mat-icon>rule_folder</mat-icon></div>
        </div>

        <div class="cf-stat-card">
          <div>
            <div class="cf-stat-value">{{ dashboard.awaitingVerificationDocumentsCount }}</div>
            <div class="cf-stat-label">Awaiting Verification</div>
          </div>
          <div class="cf-stat-icon badge-lavender"><mat-icon>fact_check</mat-icon></div>
        </div>

        <div class="cf-stat-card">
          <div>
            <div class="cf-stat-value">{{ dashboard.pendingActionsCount }}</div>
            <div class="cf-stat-label">Pending External Actions</div>
          </div>
          <div class="cf-stat-icon badge-blue"><mat-icon>pending_actions</mat-icon></div>
        </div>

        <div class="cf-stat-card">
          <div>
            <div class="cf-stat-value">{{ dashboard.requiredClientFollowUpsCount }}</div>
            <div class="cf-stat-label">Client Follow-Ups & Deadlines ({{ dashboard.upcomingDeadlinesCount }})</div>
          </div>
          <div class="cf-stat-icon badge-mint"><mat-icon>record_voice_over</mat-icon></div>
        </div>
      </div>

      <!-- Main Action Panels -->
      <div class="cf-grid-2">
        <!-- Upcoming Hearings -->
        <div class="cf-card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
            <h3 style="margin: 0; font-size: 16px; font-weight: 700;">Upcoming Court Hearings</h3>
            <a routerLink="/advocate/hearings" style="font-size: 13px; color: var(--cf-muted-blue); text-decoration: none; font-weight: 600;">View All →</a>
          </div>
          <table class="cf-table" *ngIf="dashboard.upcomingHearings.length > 0; else noHearings">
            <thead>
              <tr>
                <th>Case</th>
                <th>Date & Time</th>
                <th>Court & Purpose</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let h of dashboard.upcomingHearings">
                <td>
                  <a [routerLink]="['/advocate/cases', h.caseId]" style="font-weight: 600; color: var(--cf-navy); text-decoration: none;">{{ h.caseNumber }}</a>
                  <div style="font-size: 12px; color: var(--cf-text-secondary);">{{ h.clientName }}</div>
                </td>
                <td>
                  <span class="cf-badge badge-blue">{{ h.hearingDate | date:'dd MMM yyyy, hh:mm a' }}</span>
                </td>
                <td>
                  <div style="font-weight: 500;">{{ h.purpose }}</div>
                  <div style="font-size: 12px; color: var(--cf-text-secondary);">{{ h.courtName }} ({{ h.courtRoom }})</div>
                </td>
              </tr>
            </tbody>
          </table>
          <ng-template #noHearings>
            <div class="cf-empty-state">No upcoming hearings scheduled.</div>
          </ng-template>
        </div>

        <!-- Urgent & Overdue Tasks -->
        <div class="cf-card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
            <h3 style="margin: 0; font-size: 16px; font-weight: 700;">Urgent & Overdue Tasks</h3>
            <a routerLink="/advocate/tasks" style="font-size: 13px; color: var(--cf-muted-blue); text-decoration: none; font-weight: 600;">Manage Tasks →</a>
          </div>
          <table class="cf-table" *ngIf="dashboard.urgentAndOverdueTasks.length > 0; else noTasks">
            <thead>
              <tr>
                <th>Task</th>
                <th>Priority</th>
                <th>Due Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let t of dashboard.urgentAndOverdueTasks">
                <td>
                  <div style="font-weight: 600;">{{ t.title }}</div>
                  <div style="font-size: 12px; color: var(--cf-text-secondary);">{{ t.caseNumber }}</div>
                </td>
                <td>
                  <span class="cf-badge" [ngClass]="t.priority === 'URGENT' ? 'badge-blush' : 'badge-peach'">{{ t.priority }}</span>
                </td>
                <td>{{ t.dueDate | date:'dd MMM yyyy' }}</td>
                <td>
                  <span class="cf-badge" [ngClass]="t.overdue ? 'badge-blush' : 'badge-blue'">{{ t.status }}</span>
                </td>
              </tr>
            </tbody>
          </table>
          <ng-template #noTasks>
            <div class="cf-empty-state">All urgent tasks are cleared.</div>
          </ng-template>
        </div>
      </div>

      <div class="cf-grid-2">
        <!-- Documents Needing Attention -->
        <div class="cf-card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
            <h3 style="margin: 0; font-size: 16px; font-weight: 700;">Documents Awaiting Verification / Missing</h3>
            <a routerLink="/advocate/documents" style="font-size: 13px; color: var(--cf-muted-blue); text-decoration: none; font-weight: 600;">Document Center →</a>
          </div>
          <table class="cf-table" *ngIf="dashboard.documentsNeedingAttention.length > 0; else noDocs">
            <thead>
              <tr>
                <th>Document</th>
                <th>Case / Client</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let d of dashboard.documentsNeedingAttention">
                <td>
                  <div style="font-weight: 600;">{{ d.title }}</div>
                  <div style="font-size: 12px; color: var(--cf-text-secondary);">{{ d.category }}</div>
                </td>
                <td>
                  <div>{{ d.caseNumber }}</div>
                  <div style="font-size: 12px; color: var(--cf-text-secondary);">{{ d.clientName }}</div>
                </td>
                <td>
                  <span class="cf-badge" [ngClass]="d.status === 'AWAITING_VERIFICATION' ? 'badge-lavender' : 'badge-peach'">
                    {{ d.status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
          <ng-template #noDocs>
            <div class="cf-empty-state">All case documents are verified.</div>
          </ng-template>
        </div>

        <!-- Client Follow-Ups & Pending Actions -->
        <div class="cf-card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
            <h3 style="margin: 0; font-size: 16px; font-weight: 700;">Client Follow-Ups & Pending Responses</h3>
            <a routerLink="/advocate/client-requests" style="font-size: 13px; color: var(--cf-muted-blue); text-decoration: none; font-weight: 600;">Follow-Up Queue →</a>
          </div>
          <table class="cf-table" *ngIf="dashboard.clientFollowUps.length > 0; else noFollowUps">
            <thead>
              <tr>
                <th>Request</th>
                <th>Client</th>
                <th>Due</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let r of dashboard.clientFollowUps">
                <td>
                  <div style="font-weight: 600;">{{ r.title }}</div>
                  <div style="font-size: 12px; color: var(--cf-text-secondary);">{{ r.caseNumber }}</div>
                </td>
                <td>{{ r.clientName }}</td>
                <td>{{ r.dueDate | date:'dd MMM yyyy' }}</td>
                <td>
                  <span class="cf-badge" [ngClass]="r.status === 'SUBMITTED_BY_CLIENT' ? 'badge-mint' : 'badge-peach'">
                    {{ r.status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
          <ng-template #noFollowUps>
            <div class="cf-empty-state">No pending client follow-ups.</div>
          </ng-template>
        </div>
      </div>

      <!-- Deadlines & Recent Case Activity -->
      <div class="cf-grid-2">
        <div class="cf-card">
          <h3 style="margin: 0 0 14px 0; font-size: 16px; font-weight: 700;">Approaching Statutory & Filing Deadlines</h3>
          <table class="cf-table" *ngIf="dashboard.upcomingDeadlines.length > 0">
            <thead>
              <tr>
                <th>Case</th>
                <th>Deadline Milestone</th>
                <th>Target Date</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let c of dashboard.upcomingDeadlines">
                <td>
                  <a [routerLink]="['/advocate/cases', c.id]" style="font-weight: 600; color: var(--cf-navy); text-decoration: none;">{{ c.caseNumber }}</a>
                  <div style="font-size: 12px; color: var(--cf-text-secondary);">{{ c.title }}</div>
                </td>
                <td>{{ c.deadlineDescription || 'Case Filing Deadline' }}</td>
                <td><span class="cf-badge badge-peach">{{ c.nextDeadline | date:'dd MMM yyyy' }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="cf-card">
          <h3 style="margin: 0 0 14px 0; font-size: 16px; font-weight: 700;">Recent Case Activity Timeline</h3>
          <div *ngFor="let u of dashboard.recentCaseUpdates" style="padding: 10px 0; border-bottom: 1px solid var(--cf-border);">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-weight: 600; color: var(--cf-navy); font-size: 14px;">{{ u.title }}</span>
              <span class="cf-badge badge-blue">{{ u.caseNumber }}</span>
            </div>
            <p style="margin: 4px 0; font-size: 13px; color: var(--cf-text-secondary);">{{ u.details }}</p>
            <div style="font-size: 11px; color: #8798AD;">{{ u.createdAt | date:'dd MMM yyyy, hh:mm a' }} • {{ u.authorName }}</div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AdvocateDashboardComponent implements OnInit {
  dashboard: AdvocateDashboardModel | null = null;

  constructor(private advocateApi: AdvocateApiService) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.advocateApi.getDashboard().subscribe(data => (this.dashboard = data));
  }
}
