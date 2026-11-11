import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AdvocateApiService } from '../../../core/services/advocate-api.service';
import { LegalCaseModel, PendingActionModel } from '../../../core/models/caseflow.models';

@Component({
  selector: 'app-advocate-pending-actions',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
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
          <h1 class="cf-page-title">Pending Actions & External Dependencies</h1>
          <p class="cf-page-subtitle">Track actions awaiting clients, opposing counsel, court registries, witnesses, or third-party authorities.</p>
        </div>
        <button mat-flat-button class="cf-btn-primary" (click)="toggleForm()">
          <mat-icon>{{ showForm ? 'close' : 'add' }}</mat-icon>
          {{ showForm ? 'Cancel' : 'Add Pending Action' }}
        </button>
      </div>

      <div class="cf-card" *ngIf="showForm">
        <h3 style="margin-top: 0;">{{ editingId ? 'Update Pending Action' : 'Log New Pending Action' }}</h3>
        <form [formGroup]="actionForm" (ngSubmit)="saveAction()">
          <div class="cf-form-grid">
            <mat-form-field appearance="outline">
              <mat-label>Select Case</mat-label>
              <mat-select formControlName="caseId">
                <mat-option *ngFor="let c of cases" [value]="c.id">{{ c.caseNumber }} — {{ c.title }}</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Action Title</mat-label>
              <input matInput formControlName="title">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Responsible Party Name</mat-label>
              <input matInput formControlName="responsibleParty">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Party Category</mat-label>
              <mat-select formControlName="partyType">
                <mat-option value="CLIENT">CLIENT</mat-option>
                <mat-option value="OPPOSING_COUNSEL">OPPOSING_COUNSEL</mat-option>
                <mat-option value="COURT_REGISTRY">COURT_REGISTRY</mat-option>
                <mat-option value="WITNESS">WITNESS</mat-option>
                <mat-option value="THIRD_PARTY">THIRD_PARTY</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Status</mat-label>
              <mat-select formControlName="status">
                <mat-option value="PENDING">PENDING</mat-option>
                <mat-option value="IN_PROGRESS">IN_PROGRESS</mat-option>
                <mat-option value="RESPONDED">RESPONDED</mat-option>
                <mat-option value="COMPLETED">COMPLETED</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Due Date</mat-label>
              <input matInput type="date" formControlName="dueDate">
            </mat-form-field>

            <mat-form-field appearance="outline" style="grid-column: 1 / -1;">
              <mat-label>Instructions & Follow-Up Details</mat-label>
              <textarea matInput rows="2" formControlName="instructions"></textarea>
            </mat-form-field>

            <mat-form-field appearance="outline" style="grid-column: 1 / -1;">
              <mat-label>Resolution Notes</mat-label>
              <input matInput formControlName="resolutionNotes">
            </mat-form-field>
          </div>
          <button mat-flat-button class="cf-btn-primary" type="submit" [disabled]="actionForm.invalid">Save Pending Action</button>
        </form>
      </div>

      <div class="cf-card">
        <table class="cf-table">
          <thead>
            <tr>
              <th>Action Title & Instructions</th>
              <th>Case</th>
              <th>Responsible Party</th>
              <th>Due Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let a of actions">
              <td>
                <div style="font-weight: 700; color: var(--cf-navy);">{{ a.title }}</div>
                <div style="font-size: 12px; color: var(--cf-text-secondary);">{{ a.instructions }}</div>
              </td>
              <td><span class="cf-badge badge-blue">{{ a.caseNumber }}</span></td>
              <td>
                <div style="font-weight: 600;">{{ a.responsibleParty }}</div>
                <span class="cf-badge badge-lavender">{{ a.partyType }}</span>
              </td>
              <td>{{ a.dueDate | date:'dd MMM yyyy' }}</td>
              <td>
                <span class="cf-badge" [ngClass]="a.status === 'COMPLETED' ? 'badge-mint' : (a.overdue ? 'badge-blush' : 'badge-peach')">
                  {{ a.status }}
                </span>
              </td>
              <td>
                <button mat-stroked-button class="cf-btn-outline" *ngIf="a.status !== 'COMPLETED'" (click)="markComplete(a)" style="margin-right: 6px;">
                  Complete
                </button>
                <button mat-icon-button (click)="editAction(a)"><mat-icon>edit</mat-icon></button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class AdvocatePendingActionsComponent implements OnInit {
  actions: PendingActionModel[] = [];
  cases: LegalCaseModel[] = [];
  showForm = false;
  editingId: number | null = null;
  actionForm: FormGroup;

  constructor(
    private advocateApi: AdvocateApiService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.actionForm = this.fb.group({
      caseId: [null, Validators.required],
      title: ['', Validators.required],
      responsibleParty: ['', Validators.required],
      partyType: ['CLIENT', Validators.required],
      status: ['PENDING', Validators.required],
      dueDate: [new Date().toISOString().substring(0, 10), Validators.required],
      instructions: ['', Validators.required],
      resolutionNotes: ['']
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.advocateApi.getPendingActions().subscribe(list => (this.actions = list));
    this.advocateApi.getCases().subscribe(list => (this.cases = list));
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.editingId = null;
      this.actionForm.reset({
        partyType: 'CLIENT',
        status: 'PENDING',
        dueDate: new Date().toISOString().substring(0, 10)
      });
    }
  }

  editAction(a: PendingActionModel): void {
    this.editingId = a.id || null;
    this.showForm = true;
    this.actionForm.patchValue(a);
  }

  markComplete(a: PendingActionModel): void {
    if (!a.id) return;
    this.advocateApi.updatePendingAction(a.id, { ...a, status: 'COMPLETED' }).subscribe(() => {
      this.snackBar.open('Pending action marked as completed', 'Close', { duration: 3000 });
      this.loadData();
    });
  }

  saveAction(): void {
    if (this.actionForm.invalid) return;
    const payload: PendingActionModel = this.actionForm.value;
    if (this.editingId) {
      this.advocateApi.updatePendingAction(this.editingId, payload).subscribe(() => {
        this.snackBar.open('Pending action updated', 'Close', { duration: 3000 });
        this.toggleForm();
        this.loadData();
      });
    } else {
      this.advocateApi.createPendingAction(payload).subscribe(() => {
        this.snackBar.open('Pending action created', 'Close', { duration: 3000 });
        this.toggleForm();
        this.loadData();
      });
    }
  }
}
