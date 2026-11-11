import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AdvocateApiService } from '../../../core/services/advocate-api.service';
import { HearingModel, LegalCaseModel } from '../../../core/models/caseflow.models';

@Component({
  selector: 'app-advocate-hearings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
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
          <h1 class="cf-page-title">Hearings & Court Calendar</h1>
          <p class="cf-page-subtitle">Schedule court hearings, track past proceedings, and monitor approaching case deadlines in list or calendar view.</p>
        </div>
        <div style="display: flex; gap: 10px;">
          <button mat-stroked-button class="cf-btn-outline" (click)="calendarMode = !calendarMode">
            <mat-icon>{{ calendarMode ? 'view_list' : 'calendar_month' }}</mat-icon>
            {{ calendarMode ? 'Switch to List View' : 'Calendar View' }}
          </button>
          <button mat-flat-button class="cf-btn-primary" (click)="toggleForm()">
            <mat-icon>{{ showForm ? 'close' : 'add' }}</mat-icon>
            {{ showForm ? 'Cancel' : 'Schedule Hearing' }}
          </button>
        </div>
      </div>

      <div class="cf-card" *ngIf="showForm">
        <h3 style="margin-top: 0;">{{ editingId ? 'Update Hearing' : 'Schedule New Court Hearing' }}</h3>
        <form [formGroup]="hearingForm" (ngSubmit)="saveHearing()">
          <div class="cf-form-grid">
            <mat-form-field appearance="outline">
              <mat-label>Select Case</mat-label>
              <mat-select formControlName="caseId" (selectionChange)="onCaseSelected($event.value)">
                <mat-option *ngFor="let c of cases" [value]="c.id">{{ c.caseNumber }} — {{ c.title }}</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Hearing Date & Time</mat-label>
              <input matInput type="datetime-local" formControlName="hearingDate">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Court Name</mat-label>
              <input matInput formControlName="courtName">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Court Hall / Room</mat-label>
              <input matInput formControlName="courtRoom">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Hearing Purpose / Stage</mat-label>
              <input matInput formControlName="purpose">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Status</mat-label>
              <mat-select formControlName="status">
                <mat-option value="SCHEDULED">SCHEDULED</mat-option>
                <mat-option value="COMPLETED">COMPLETED</mat-option>
                <mat-option value="ADJOURNED">ADJOURNED</mat-option>
                <mat-option value="CANCELLED">CANCELLED</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" style="grid-column: 1 / -1;">
              <mat-label>Outcome / Order Notes</mat-label>
              <textarea matInput rows="2" formControlName="outcomeNotes"></textarea>
            </mat-form-field>

            <mat-form-field appearance="outline" style="grid-column: 1 / -1;">
              <mat-label>Next Steps & Follow-Up Action</mat-label>
              <input matInput formControlName="nextSteps">
            </mat-form-field>
          </div>
          <div style="display: flex; justify-content: flex-end; gap: 10px;">
            <button mat-button type="button" (click)="toggleForm()">Cancel</button>
            <button mat-flat-button class="cf-btn-primary" type="submit" [disabled]="hearingForm.invalid">Save Hearing</button>
          </div>
        </form>
      </div>

      <!-- Calendar Style Grouped View -->
      <div *ngIf="calendarMode" class="cf-grid-3">
        <div class="cf-card" *ngFor="let h of hearings" style="border-left: 4px solid var(--cf-navy);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span class="cf-badge badge-blue">{{ h.hearingDate | date:'EEE, dd MMM yyyy • hh:mm a' }}</span>
            <span class="cf-badge" [ngClass]="h.status === 'SCHEDULED' ? 'badge-mint' : 'badge-lavender'">{{ h.status }}</span>
          </div>
          <div style="font-weight: 700; color: var(--cf-navy); font-size: 15px;">{{ h.caseNumber }}</div>
          <div style="font-size: 13px; margin-bottom: 6px;">{{ h.caseTitle }}</div>
          <div style="font-size: 13px; font-weight: 600;">Purpose: {{ h.purpose }}</div>
          <div style="font-size: 12px; color: var(--cf-text-secondary); margin-top: 4px;">{{ h.courtName }} ({{ h.courtRoom }})</div>
        </div>
      </div>

      <!-- List Table View -->
      <div class="cf-card" *ngIf="!calendarMode">
        <table class="cf-table">
          <thead>
            <tr>
              <th>Date & Time</th>
              <th>Case & Client</th>
              <th>Court & Room</th>
              <th>Purpose</th>
              <th>Status</th>
              <th>Outcome / Next Steps</th>
              <th>Edit</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let h of hearings">
              <td><span class="cf-badge badge-blue">{{ h.hearingDate | date:'dd MMM yyyy, hh:mm a' }}</span></td>
              <td>
                <div style="font-weight: 700; color: var(--cf-navy);">{{ h.caseNumber }}</div>
                <div style="font-size: 12px; color: var(--cf-text-secondary);">{{ h.clientName }}</div>
              </td>
              <td>
                <div>{{ h.courtName }}</div>
                <div style="font-size: 12px; color: var(--cf-text-secondary);">{{ h.courtRoom }}</div>
              </td>
              <td>{{ h.purpose }}</td>
              <td><span class="cf-badge badge-mint">{{ h.status }}</span></td>
              <td>
                <div>{{ h.outcomeNotes }}</div>
                <div style="font-size: 12px; color: var(--cf-text-secondary);">{{ h.nextSteps }}</div>
              </td>
              <td>
                <button mat-icon-button (click)="editHearing(h)"><mat-icon>edit</mat-icon></button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class AdvocateHearingsComponent implements OnInit {
  hearings: HearingModel[] = [];
  cases: LegalCaseModel[] = [];
  showForm = false;
  calendarMode = false;
  editingId: number | null = null;
  hearingForm: FormGroup;

  constructor(
    private advocateApi: AdvocateApiService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.hearingForm = this.fb.group({
      caseId: [null, Validators.required],
      hearingDate: ['', Validators.required],
      courtName: ['', Validators.required],
      courtRoom: [''],
      purpose: ['', Validators.required],
      status: ['SCHEDULED', Validators.required],
      outcomeNotes: [''],
      nextSteps: ['']
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.advocateApi.getHearings().subscribe(list => (this.hearings = list));
    this.advocateApi.getCases().subscribe(list => (this.cases = list));
  }

  onCaseSelected(caseId: number): void {
    const found = this.cases.find(c => c.id === caseId);
    if (found) {
      this.hearingForm.patchValue({
        courtName: found.courtName,
        courtRoom: found.courtHall || ''
      });
    }
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.editingId = null;
      this.hearingForm.reset({ status: 'SCHEDULED' });
    }
  }

  editHearing(h: HearingModel): void {
    this.editingId = h.id || null;
    this.showForm = true;
    this.hearingForm.patchValue({
      ...h,
      hearingDate: h.hearingDate ? h.hearingDate.substring(0, 16) : ''
    });
  }

  saveHearing(): void {
    if (this.hearingForm.invalid) return;
    const raw = this.hearingForm.value;
    const payload: HearingModel = {
      ...raw,
      hearingDate: raw.hearingDate.length === 16 ? raw.hearingDate + ':00' : raw.hearingDate
    };

    if (this.editingId) {
      this.advocateApi.updateHearing(this.editingId, payload).subscribe(() => {
        this.snackBar.open('Hearing updated', 'Close', { duration: 3000 });
        this.toggleForm();
        this.loadData();
      });
    } else {
      this.advocateApi.createHearing(payload).subscribe(() => {
        this.snackBar.open('Hearing scheduled and client notified', 'Close', { duration: 3000 });
        this.toggleForm();
        this.loadData();
      });
    }
  }
}
