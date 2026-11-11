import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AdvocateApiService } from '../../../core/services/advocate-api.service';
import { DocumentNotificationService } from '../../../core/services/document-notification.service';
import {
  CaseUpdateModel,
  DocumentModel,
  HearingModel,
  LegalCaseModel,
  PendingActionModel,
  TaskModel
} from '../../../core/models/caseflow.models';

@Component({
  selector: 'app-advocate-case-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatTabsModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule
  ],
  template: `
    <div class="cf-page-container" *ngIf="legalCase">
      <div class="cf-page-header">
        <div>
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 6px;">
            <a routerLink="/advocate/cases" style="color: var(--cf-muted-blue); text-decoration: none; font-size: 13px; font-weight: 600;">← Back to Cases</a>
            <span class="cf-badge badge-blue">{{ legalCase.status }}</span>
            <span class="cf-badge badge-blush">{{ legalCase.priority }}</span>
          </div>
          <h1 class="cf-page-title">{{ legalCase.caseNumber }} — {{ legalCase.title }}</h1>
          <p class="cf-page-subtitle">{{ legalCase.courtName }} ({{ legalCase.courtHall }}) • Presiding: {{ legalCase.judgeName }}</p>
        </div>
      </div>

      <!-- Case Metadata Summary Card -->
      <div class="cf-card">
        <div class="cf-grid-4" style="margin-bottom: 12px;">
          <div>
            <div style="font-size: 12px; color: var(--cf-text-secondary);">Client</div>
            <div style="font-weight: 700;">{{ legalCase.clientName }}</div>
            <div style="font-size: 12px;">{{ legalCase.clientEmail }} • {{ legalCase.clientPhone }}</div>
          </div>
          <div>
            <div style="font-size: 12px; color: var(--cf-text-secondary);">Opposing Party & Counsel</div>
            <div style="font-weight: 600;">{{ legalCase.opposingParty || 'N/A' }}</div>
            <div style="font-size: 12px;">{{ legalCase.opposingCounsel }}</div>
          </div>
          <div>
            <div style="font-size: 12px; color: var(--cf-text-secondary);">Filing Date</div>
            <div style="font-weight: 600;">{{ legalCase.filingDate | date:'dd MMM yyyy' }}</div>
          </div>
          <div>
            <div style="font-size: 12px; color: var(--cf-text-secondary);">Next Statutory Deadline</div>
            <div style="font-weight: 700; color: var(--cf-pastel-peach-text);">{{ legalCase.nextDeadline | date:'dd MMM yyyy' }}</div>
            <div style="font-size: 12px;">{{ legalCase.deadlineDescription }}</div>
          </div>
        </div>
        <div style="font-size: 14px; color: var(--cf-text-primary); background: #F8FAFE; padding: 12px 16px; border-radius: 8px;">
          <strong>Case Synopsis:</strong> {{ legalCase.description }}
        </div>
      </div>

      <!-- Tabbed Case Workspace -->
      <div class="cf-card">
        <mat-tab-group>
          <!-- Activity History & Updates -->
          <mat-tab label="Case Activity & Updates ({{ updates.length }})">
            <div style="padding: 20px 0;">
              <div style="background: #F7F9FC; padding: 16px; border-radius: 10px; margin-bottom: 20px;">
                <h4 style="margin-top: 0;">Post New Case Update / Milestone</h4>
                <div class="cf-form-grid">
                  <mat-form-field appearance="outline">
                    <mat-label>Update Category</mat-label>
                    <input matInput [(ngModel)]="newUpdate.updateType" placeholder="ORDER_PASSED / FILING / NOTE">
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>Headline</mat-label>
                    <input matInput [(ngModel)]="newUpdate.title">
                  </mat-form-field>
                  <mat-form-field appearance="outline" style="grid-column: 1 / -1;">
                    <mat-label>Detailed Progress Note</mat-label>
                    <textarea matInput rows="2" [(ngModel)]="newUpdate.details"></textarea>
                  </mat-form-field>
                </div>
                <button mat-flat-button class="cf-btn-primary" (click)="postUpdate()">Post Case Update</button>
              </div>

              <div *ngFor="let u of updates" style="padding: 14px 0; border-bottom: 1px solid var(--cf-border);">
                <div style="display: flex; justify-content: space-between;">
                  <span style="font-weight: 700; color: var(--cf-navy);">{{ u.title }}</span>
                  <span class="cf-badge badge-blue">{{ u.updateType }}</span>
                </div>
                <p style="margin: 6px 0; font-size: 14px;">{{ u.details }}</p>
                <div style="font-size: 12px; color: var(--cf-text-secondary);">{{ u.createdAt | date:'dd MMM yyyy, hh:mm a' }} • {{ u.authorName }}</div>
              </div>
            </div>
          </mat-tab>

          <!-- Hearings -->
          <mat-tab label="Hearings ({{ hearings.length }})">
            <div style="padding: 20px 0;">
              <table class="cf-table">
                <thead>
                  <tr>
                    <th>Hearing Date</th>
                    <th>Court & Room</th>
                    <th>Purpose</th>
                    <th>Status</th>
                    <th>Outcome / Next Steps</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let h of hearings">
                    <td><strong>{{ h.hearingDate | date:'dd MMM yyyy, hh:mm a' }}</strong></td>
                    <td>{{ h.courtName }} ({{ h.courtRoom }})</td>
                    <td>{{ h.purpose }}</td>
                    <td><span class="cf-badge badge-mint">{{ h.status }}</span></td>
                    <td>
                      <div>{{ h.outcomeNotes }}</div>
                      <div style="font-size: 12px; color: var(--cf-text-secondary);">{{ h.nextSteps }}</div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </mat-tab>

          <!-- Tasks -->
          <mat-tab label="Case Tasks ({{ tasks.length }})">
            <div style="padding: 20px 0;">
              <table class="cf-table">
                <thead>
                  <tr>
                    <th>Task</th>
                    <th>Priority</th>
                    <th>Due Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let t of tasks">
                    <td>
                      <div style="font-weight: 600;">{{ t.title }}</div>
                      <div style="font-size: 12px; color: var(--cf-text-secondary);">{{ t.description }}</div>
                    </td>
                    <td><span class="cf-badge badge-peach">{{ t.priority }}</span></td>
                    <td>{{ t.dueDate | date:'dd MMM yyyy' }}</td>
                    <td><span class="cf-badge badge-blue">{{ t.status }}</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </mat-tab>

          <!-- Documents -->
          <mat-tab label="Documents ({{ documents.length }})">
            <div style="padding: 20px 0;">
              <table class="cf-table">
                <thead>
                  <tr>
                    <th>Title & Category</th>
                    <th>File Name</th>
                    <th>Status</th>
                    <th>Remarks</th>
                    <th>Download</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let d of documents">
                    <td>
                      <div style="font-weight: 600;">{{ d.title }}</div>
                      <div style="font-size: 12px; color: var(--cf-text-secondary);">{{ d.category }}</div>
                    </td>
                    <td>{{ d.fileName || 'Not uploaded yet' }}</td>
                    <td><span class="cf-badge badge-lavender">{{ d.status }}</span></td>
                    <td>{{ d.verificationRemarks }}</td>
                    <td>
                      <button mat-stroked-button class="cf-btn-outline" *ngIf="d.fileName" (click)="download(d)">
                        <mat-icon>download</mat-icon> Download
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </mat-tab>

          <!-- Pending Actions -->
          <mat-tab label="Pending Actions ({{ pendingActions.length }})">
            <div style="padding: 20px 0;">
              <table class="cf-table">
                <thead>
                  <tr>
                    <th>Action Title</th>
                    <th>Responsible Party</th>
                    <th>Instructions</th>
                    <th>Due Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let a of pendingActions">
                    <td><strong>{{ a.title }}</strong></td>
                    <td>{{ a.responsibleParty }} ({{ a.partyType }})</td>
                    <td>{{ a.instructions }}</td>
                    <td>{{ a.dueDate | date:'dd MMM yyyy' }}</td>
                    <td><span class="cf-badge badge-peach">{{ a.status }}</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </mat-tab>
        </mat-tab-group>
      </div>
    </div>
  `
})
export class AdvocateCaseDetailComponent implements OnInit {
  caseId!: number;
  legalCase: LegalCaseModel | null = null;
  updates: CaseUpdateModel[] = [];
  hearings: HearingModel[] = [];
  tasks: TaskModel[] = [];
  documents: DocumentModel[] = [];
  pendingActions: PendingActionModel[] = [];

  newUpdate: CaseUpdateModel = {
    caseId: 0,
    updateType: 'PROGRESS_NOTE',
    title: '',
    details: '',
    visibleToClient: true
  };

  constructor(
    private route: ActivatedRoute,
    private advocateApi: AdvocateApiService,
    private docService: DocumentNotificationService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.caseId = Number(this.route.snapshot.paramMap.get('id'));
    this.newUpdate.caseId = this.caseId;
    this.loadAll();
  }

  loadAll(): void {
    this.advocateApi.getCaseById(this.caseId).subscribe(c => (this.legalCase = c));
    this.advocateApi.getCaseUpdates(this.caseId).subscribe(u => (this.updates = u));
    this.advocateApi.getHearingsByCase(this.caseId).subscribe(h => (this.hearings = h));
    this.advocateApi.getTasksByCase(this.caseId).subscribe(t => (this.tasks = t));
    this.docService.getCaseDocuments(this.caseId).subscribe(d => (this.documents = d));
    this.advocateApi.getPendingActionsByCase(this.caseId).subscribe(a => (this.pendingActions = a));
  }

  postUpdate(): void {
    if (!this.newUpdate.title || !this.newUpdate.details) return;
    this.advocateApi.addCaseUpdate(this.newUpdate).subscribe(() => {
      this.snackBar.open('Case update recorded and client notified', 'Close', { duration: 3000 });
      this.newUpdate.title = '';
      this.newUpdate.details = '';
      this.advocateApi.getCaseUpdates(this.caseId).subscribe(u => (this.updates = u));
    });
  }

  download(d: DocumentModel): void {
    if (d.id && d.fileName) {
      this.docService.downloadDocument(d.id, d.fileName);
    }
  }
}
