import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AdvocateApiService } from '../../../core/services/advocate-api.service';
import { ClientModel, LegalCaseModel } from '../../../core/models/caseflow.models';

@Component({
  selector: 'app-advocate-cases',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule
  ],
  template: `
    <div class="cf-page-container">
      <div class="cf-page-header">
        <div>
          <h1 class="cf-page-title">Legal Case Registry</h1>
          <p class="cf-page-subtitle">Manage active litigation, court references, assigned clients, and statutory filing deadlines.</p>
        </div>
        <button mat-flat-button class="cf-btn-primary" (click)="toggleForm()">
          <mat-icon>{{ showForm ? 'close' : 'add' }}</mat-icon>
          {{ showForm ? 'Cancel' : 'Register New Case' }}
        </button>
      </div>

      <!-- Create / Edit Case Form -->
      <div class="cf-card" *ngIf="showForm">
        <h3 style="margin-top: 0;">{{ editingCaseId ? 'Update Legal Case' : 'Register New Legal Case' }}</h3>
        <form [formGroup]="caseForm" (ngSubmit)="saveCase()">
          <div class="cf-form-grid">
            <mat-form-field appearance="outline">
              <mat-label>Case Number (e.g., OS/501/2026)</mat-label>
              <input matInput formControlName="caseNumber">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Case Title</mat-label>
              <input matInput formControlName="title">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Associated Client</mat-label>
              <mat-select formControlName="clientId">
                <mat-option *ngFor="let c of clients" [value]="c.id">{{ c.fullName }} ({{ c.email }})</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Case Category / Type</mat-label>
              <input matInput formControlName="caseType" placeholder="Civil Suit / Writ / Arbitration">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Case Status</mat-label>
              <mat-select formControlName="status">
                <mat-option value="OPEN">OPEN</mat-option>
                <mat-option value="IN_PROGRESS">IN_PROGRESS</mat-option>
                <mat-option value="AWAITING_HEARING">AWAITING_HEARING</mat-option>
                <mat-option value="PENDING_CLIENT">PENDING_CLIENT</mat-option>
                <mat-option value="DISPOSED">DISPOSED</mat-option>
                <mat-option value="CLOSED">CLOSED</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Priority</mat-label>
              <mat-select formControlName="priority">
                <mat-option value="LOW">LOW</mat-option>
                <mat-option value="MEDIUM">MEDIUM</mat-option>
                <mat-option value="HIGH">HIGH</mat-option>
                <mat-option value="URGENT">URGENT</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Court Name</mat-label>
              <input matInput formControlName="courtName">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Court Hall / Bench</mat-label>
              <input matInput formControlName="courtHall">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Presiding Judge</mat-label>
              <input matInput formControlName="judgeName">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Opposing Party</mat-label>
              <input matInput formControlName="opposingParty">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Opposing Counsel</mat-label>
              <input matInput formControlName="opposingCounsel">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Filing Date</mat-label>
              <input matInput type="date" formControlName="filingDate">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Next Statutory Deadline</mat-label>
              <input matInput type="date" formControlName="nextDeadline">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Deadline Milestone Description</mat-label>
              <input matInput formControlName="deadlineDescription">
            </mat-form-field>

            <mat-form-field appearance="outline" style="grid-column: 1 / -1;">
              <mat-label>Case Summary & Relief Sought</mat-label>
              <textarea matInput rows="3" formControlName="description"></textarea>
            </mat-form-field>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 12px;">
            <button mat-button type="button" (click)="toggleForm()">Cancel</button>
            <button mat-flat-button class="cf-btn-primary" type="submit" [disabled]="caseForm.invalid">
              {{ editingCaseId ? 'Save Changes' : 'Register Case' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Filter Bar -->
      <div class="cf-card" style="display: flex; gap: 16px; align-items: center; flex-wrap: wrap;">
        <mat-form-field appearance="outline" style="flex: 1; min-width: 240px; margin-bottom: -1.25em;">
          <mat-label>Search by Case Number, Title, Client, or Court</mat-label>
          <input matInput [(ngModel)]="searchTerm">
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>

        <mat-form-field appearance="outline" style="width: 200px; margin-bottom: -1.25em;">
          <mat-label>Filter Status</mat-label>
          <mat-select [(ngModel)]="statusFilter">
            <mat-option value="">All Statuses</mat-option>
            <mat-option value="OPEN">OPEN</mat-option>
            <mat-option value="IN_PROGRESS">IN_PROGRESS</mat-option>
            <mat-option value="AWAITING_HEARING">AWAITING_HEARING</mat-option>
            <mat-option value="PENDING_CLIENT">PENDING_CLIENT</mat-option>
            <mat-option value="DISPOSED">DISPOSED</mat-option>
            <mat-option value="CLOSED">CLOSED</mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      <!-- Cases Table -->
      <div class="cf-card">
        <table class="cf-table">
          <thead>
            <tr>
              <th>Case Number & Title</th>
              <th>Client</th>
              <th>Court & Judge</th>
              <th>Status & Priority</th>
              <th>Next Hearing / Deadline</th>
              <th>Pending Items</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let c of filteredCases()">
              <td>
                <a [routerLink]="['/advocate/cases', c.id]" style="font-weight: 700; color: var(--cf-navy); text-decoration: none; font-size: 15px;">
                  {{ c.caseNumber }}
                </a>
                <div style="font-weight: 500; margin-top: 2px;">{{ c.title }}</div>
                <div style="font-size: 12px; color: var(--cf-text-secondary);">{{ c.caseType }}</div>
              </td>
              <td>
                <div style="font-weight: 600;">{{ c.clientName }}</div>
                <div style="font-size: 12px; color: var(--cf-text-secondary);">{{ c.clientPhone }}</div>
              </td>
              <td>
                <div>{{ c.courtName }}</div>
                <div style="font-size: 12px; color: var(--cf-text-secondary);">{{ c.courtHall }} • {{ c.judgeName }}</div>
              </td>
              <td>
                <span class="cf-badge badge-blue" style="margin-right: 6px;">{{ c.status }}</span>
                <span class="cf-badge" [ngClass]="c.priority === 'URGENT' ? 'badge-blush' : 'badge-lavender'">{{ c.priority }}</span>
              </td>
              <td>
                <div *ngIf="c.nextHearingDate" style="font-size: 12px;">
                  <strong>Hearing:</strong> {{ c.nextHearingDate | date:'dd MMM yyyy' }}
                </div>
                <div *ngIf="c.nextDeadline" style="font-size: 12px; color: var(--cf-pastel-peach-text);">
                  <strong>Deadline:</strong> {{ c.nextDeadline | date:'dd MMM yyyy' }}
                </div>
              </td>
              <td>
                <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                  <span class="cf-badge badge-peach" *ngIf="c.pendingTasksCount">{{ c.pendingTasksCount }} Tasks</span>
                  <span class="cf-badge badge-blush" *ngIf="c.missingDocumentsCount">{{ c.missingDocumentsCount }} Docs</span>
                  <span class="cf-badge badge-lavender" *ngIf="c.pendingActionsCount">{{ c.pendingActionsCount }} Actions</span>
                </div>
              </td>
              <td>
                <div style="display: flex; gap: 6px;">
                  <a mat-stroked-button class="cf-btn-outline" [routerLink]="['/advocate/cases', c.id]">Open</a>
                  <button mat-icon-button (click)="editCase(c)" title="Edit Case"><mat-icon>edit</mat-icon></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class AdvocateCasesComponent implements OnInit {
  cases: LegalCaseModel[] = [];
  clients: ClientModel[] = [];
  showForm = false;
  editingCaseId: number | null = null;
  searchTerm = '';
  statusFilter = '';
  caseForm: FormGroup;

  constructor(
    private advocateApi: AdvocateApiService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.caseForm = this.fb.group({
      caseNumber: ['', Validators.required],
      title: ['', Validators.required],
      clientId: [null, Validators.required],
      caseType: ['Civil Suit', Validators.required],
      status: ['OPEN', Validators.required],
      priority: ['HIGH', Validators.required],
      courtName: ['', Validators.required],
      courtHall: [''],
      judgeName: [''],
      opposingParty: [''],
      opposingCounsel: [''],
      filingDate: [new Date().toISOString().substring(0, 10), Validators.required],
      nextDeadline: [''],
      deadlineDescription: [''],
      description: ['']
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.advocateApi.getCases().subscribe(list => (this.cases = list));
    this.advocateApi.getClients().subscribe(list => (this.clients = list));
  }

  filteredCases(): LegalCaseModel[] {
    return this.cases.filter(c => {
      const matchesStatus = !this.statusFilter || c.status === this.statusFilter;
      const q = this.searchTerm.toLowerCase();
      const matchesQuery =
        !q ||
        c.caseNumber.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        (c.clientName && c.clientName.toLowerCase().includes(q)) ||
        c.courtName.toLowerCase().includes(q);
      return matchesStatus && matchesQuery;
    });
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.editingCaseId = null;
      this.caseForm.reset({
        caseType: 'Civil Suit',
        status: 'OPEN',
        priority: 'HIGH',
        filingDate: new Date().toISOString().substring(0, 10)
      });
    }
  }

  editCase(c: LegalCaseModel): void {
    this.editingCaseId = c.id || null;
    this.showForm = true;
    this.caseForm.patchValue(c);
  }

  saveCase(): void {
    if (this.caseForm.invalid) return;
    const payload: LegalCaseModel = this.caseForm.value;
    if (this.editingCaseId) {
      this.advocateApi.updateCase(this.editingCaseId, payload).subscribe({
        next: () => {
          this.snackBar.open('Case updated successfully', 'Close', { duration: 3000 });
          this.toggleForm();
          this.loadData();
        },
        error: err => this.snackBar.open(err.error?.message || 'Update failed', 'Close', { duration: 4000 })
      });
    } else {
      this.advocateApi.createCase(payload).subscribe({
        next: () => {
          this.snackBar.open('New legal case registered', 'Close', { duration: 3000 });
          this.toggleForm();
          this.loadData();
        },
        error: err => this.snackBar.open(err.error?.message || 'Creation failed', 'Close', { duration: 4000 })
      });
    }
  }
}
