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
import { ClientRequestModel, ClientRequestStatus, LegalCaseModel } from '../../../core/models/caseflow.models';

@Component({
  selector: 'app-advocate-client-requests',
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
          <h1 class="cf-page-title">Client Requests & Follow-Up Workflow</h1>
          <p class="cf-page-subtitle">Send structured information/clarification requests to clients and review their submitted responses.</p>
        </div>
        <button mat-flat-button class="cf-btn-primary" (click)="showForm = !showForm">
          <mat-icon>{{ showForm ? 'close' : 'send' }}</mat-icon>
          {{ showForm ? 'Cancel' : 'Send Client Request' }}
        </button>
      </div>

      <div class="cf-card" *ngIf="showForm">
        <h3 style="margin-top: 0;">Create New Request for Client</h3>
        <form [formGroup]="reqForm" (ngSubmit)="createRequest()">
          <div class="cf-form-grid">
            <mat-form-field appearance="outline">
              <mat-label>Select Case</mat-label>
              <mat-select formControlName="caseId" (selectionChange)="onCaseChange($event.value)">
                <mat-option *ngFor="let c of cases" [value]="c.id">{{ c.caseNumber }} — {{ c.clientName }}</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Request Type</mat-label>
              <mat-select formControlName="requestType">
                <mat-option value="INFORMATION_REQUEST">INFORMATION_REQUEST</mat-option>
                <mat-option value="DOCUMENT_SUBMISSION">DOCUMENT_SUBMISSION</mat-option>
                <mat-option value="AFFIDAVIT_SIGNATURE">AFFIDAVIT_SIGNATURE</mat-option>
                <mat-option value="CLARIFICATION">CLARIFICATION</mat-option>
                <mat-option value="FEES_OR_BILLING">FEES_OR_BILLING</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Request Subject / Title</mat-label>
              <input matInput formControlName="title">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Due Date</mat-label>
              <input matInput type="date" formControlName="dueDate">
            </mat-form-field>

            <mat-form-field appearance="outline" style="grid-column: 1 / -1;">
              <mat-label>Detailed Instructions for Client</mat-label>
              <textarea matInput rows="2" formControlName="instructions"></textarea>
            </mat-form-field>
          </div>
          <button mat-flat-button class="cf-btn-primary" type="submit" [disabled]="reqForm.invalid">Send Request to Client</button>
        </form>
      </div>

      <div class="cf-card">
        <table class="cf-table">
          <thead>
            <tr>
              <th>Request & Instructions</th>
              <th>Case & Client</th>
              <th>Client Submitted Response</th>
              <th>Due Date</th>
              <th>Status</th>
              <th>Advocate Review</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let r of requests">
              <td>
                <div style="font-weight: 700; color: var(--cf-navy);">{{ r.title }}</div>
                <span class="cf-badge badge-lavender" style="margin: 4px 0;">{{ r.requestType }}</span>
                <div style="font-size: 12px; color: var(--cf-text-secondary);">{{ r.instructions }}</div>
              </td>
              <td>
                <div style="font-weight: 600;">{{ r.caseNumber }}</div>
                <div style="font-size: 12px; color: var(--cf-text-secondary);">{{ r.clientName }}</div>
              </td>
              <td style="max-width: 280px;">
                <div *ngIf="r.clientResponse" style="background: #F4F8FF; padding: 8px 10px; border-radius: 8px; font-size: 13px;">
                  {{ r.clientResponse }}
                </div>
                <div *ngIf="!r.clientResponse" style="color: var(--cf-text-secondary); font-size: 12px;">Awaiting client response...</div>
              </td>
              <td>{{ r.dueDate | date:'dd MMM yyyy' }}</td>
              <td>
                <span class="cf-badge" [ngClass]="{
                  'badge-peach': r.status === 'PENDING_CLIENT',
                  'badge-blue': r.status === 'SUBMITTED_BY_CLIENT',
                  'badge-mint': r.status === 'APPROVED',
                  'badge-blush': r.status === 'NEEDS_REVISION'
                }">{{ r.status }}</span>
              </td>
              <td>
                <div style="display: flex; gap: 6px;" *ngIf="r.status === 'SUBMITTED_BY_CLIENT'">
                  <button mat-flat-button class="cf-btn-primary" (click)="review(r, 'APPROVED')">Approve</button>
                  <button mat-stroked-button color="warn" (click)="review(r, 'NEEDS_REVISION')">Request Revision</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class AdvocateClientRequestsComponent implements OnInit {
  requests: ClientRequestModel[] = [];
  cases: LegalCaseModel[] = [];
  showForm = false;
  reqForm: FormGroup;

  constructor(
    private advocateApi: AdvocateApiService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.reqForm = this.fb.group({
      caseId: [null, Validators.required],
      clientId: [null, Validators.required],
      requestType: ['INFORMATION_REQUEST', Validators.required],
      title: ['', Validators.required],
      dueDate: [new Date().toISOString().substring(0, 10), Validators.required],
      instructions: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.advocateApi.getClientRequests().subscribe(list => (this.requests = list));
    this.advocateApi.getCases().subscribe(list => (this.cases = list));
  }

  onCaseChange(caseId: number): void {
    const found = this.cases.find(c => c.id === caseId);
    if (found) {
      this.reqForm.patchValue({ clientId: found.clientId });
    }
  }

  createRequest(): void {
    if (this.reqForm.invalid) return;
    this.advocateApi.createClientRequest(this.reqForm.value).subscribe(() => {
      this.snackBar.open('Client request dispatched', 'Close', { duration: 3000 });
      this.showForm = false;
      this.loadData();
    });
  }

  review(r: ClientRequestModel, status: ClientRequestStatus): void {
    if (!r.id) return;
    const notes = status === 'APPROVED'
      ? 'Reviewed and approved by Advocate'
      : 'Please provide additional clarification on the dates.';
    this.advocateApi.reviewClientRequest(r.id, status, notes).subscribe(() => {
      this.snackBar.open(`Request marked as ${status}`, 'Close', { duration: 3000 });
      this.loadData();
    });
  }
}
