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
import { DocumentNotificationService } from '../../../core/services/document-notification.service';
import { DocumentModel, DocumentStatus, LegalCaseModel } from '../../../core/models/caseflow.models';

@Component({
  selector: 'app-advocate-documents',
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
          <h1 class="cf-page-title">Document Repository & MinIO Object Storage</h1>
          <p class="cf-page-subtitle">Upload legal documents to MinIO, request required documents from clients, and verify submitted filings.</p>
        </div>
        <div style="display: flex; gap: 10px;">
          <button mat-stroked-button class="cf-btn-outline" (click)="showRequestForm = !showRequestForm; showUploadForm = false">
            <mat-icon>rule_folder</mat-icon> Request Required Document
          </button>
          <button mat-flat-button class="cf-btn-primary" (click)="showUploadForm = !showUploadForm; showRequestForm = false">
            <mat-icon>cloud_upload</mat-icon> Upload Document to MinIO
          </button>
        </div>
      </div>

      <!-- Request Required Document Form -->
      <div class="cf-card" *ngIf="showRequestForm">
        <h3 style="margin-top: 0;">Request Missing / Required Document from Client</h3>
        <form [formGroup]="reqDocForm" (ngSubmit)="requestDocument()">
          <div class="cf-form-grid">
            <mat-form-field appearance="outline">
              <mat-label>Select Case</mat-label>
              <mat-select formControlName="caseId">
                <mat-option *ngFor="let c of cases" [value]="c.id">{{ c.caseNumber }} — {{ c.clientName }}</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Document Title</mat-label>
              <input matInput formControlName="title" placeholder="Certified Sale Deed / Encumbrance Certificate">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Category</mat-label>
              <input matInput formControlName="category" placeholder="Revenue Record / Affidavit / Identity">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Submission Due Date</mat-label>
              <input matInput type="date" formControlName="dueDate">
            </mat-form-field>

            <mat-form-field appearance="outline" style="grid-column: 1 / -1;">
              <mat-label>Instructions for Client</mat-label>
              <input matInput formControlName="description">
            </mat-form-field>
          </div>
          <button mat-flat-button class="cf-btn-primary" type="submit" [disabled]="reqDocForm.invalid">Create Requirement</button>
        </form>
      </div>

      <!-- Upload Document to MinIO Form -->
      <div class="cf-card" *ngIf="showUploadForm">
        <h3 style="margin-top: 0;">Upload Legal Document to MinIO Storage</h3>
        <div class="cf-form-grid">
          <mat-form-field appearance="outline">
            <mat-label>Select Case</mat-label>
            <mat-select [(ngModel)]="uploadCaseId">
              <mat-option *ngFor="let c of cases" [value]="c.id">{{ c.caseNumber }} — {{ c.title }}</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Document Title</mat-label>
            <input matInput [(ngModel)]="uploadTitle">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Category</mat-label>
            <input matInput [(ngModel)]="uploadCategory" placeholder="Pleading / Court Order / Evidence">
          </mat-form-field>

          <div style="display: flex; align-items: center;">
            <input type="file" (change)="onFilePicked($event)" accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.txt">
          </div>
        </div>
        <button mat-flat-button class="cf-btn-primary" (click)="uploadNow()" [disabled]="!selectedFile || !uploadCaseId">
          Upload & Verify
        </button>
      </div>

      <div class="cf-card">
        <table class="cf-table">
          <thead>
            <tr>
              <th>Document Title & Category</th>
              <th>Case & Client</th>
              <th>File Info</th>
              <th>Status</th>
              <th>Verification Remarks</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let d of documents">
              <td>
                <div style="font-weight: 700; color: var(--cf-navy);">{{ d.title }}</div>
                <div style="font-size: 12px; color: var(--cf-text-secondary);">{{ d.category }}</div>
              </td>
              <td>
                <div style="font-weight: 600;">{{ d.caseNumber }}</div>
                <div style="font-size: 12px; color: var(--cf-text-secondary);">{{ d.clientName }}</div>
              </td>
              <td>
                <div *ngIf="d.fileName">{{ d.fileName }}</div>
                <div *ngIf="!d.fileName" style="color: #A62639; font-size: 12px;">Missing / Not Uploaded</div>
              </td>
              <td>
                <span class="cf-badge" [ngClass]="{
                  'badge-peach': d.status === 'REQUIRED',
                  'badge-lavender': d.status === 'AWAITING_VERIFICATION',
                  'badge-mint': d.status === 'VERIFIED',
                  'badge-blush': d.status === 'REJECTED'
                }">{{ d.status }}</span>
              </td>
              <td>{{ d.verificationRemarks || d.description }}</td>
              <td>
                <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                  <button mat-stroked-button class="cf-btn-outline" *ngIf="d.fileName" (click)="download(d)">
                    <mat-icon>download</mat-icon>
                  </button>
                  <button mat-flat-button class="cf-btn-primary" *ngIf="d.status === 'AWAITING_VERIFICATION'" (click)="verify(d, 'VERIFIED')">
                    Verify
                  </button>
                  <button mat-stroked-button color="warn" *ngIf="d.status === 'AWAITING_VERIFICATION'" (click)="verify(d, 'REJECTED')">
                    Reject
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class AdvocateDocumentsComponent implements OnInit {
  documents: DocumentModel[] = [];
  cases: LegalCaseModel[] = [];
  showRequestForm = false;
  showUploadForm = false;
  reqDocForm: FormGroup;

  uploadCaseId: number | null = null;
  uploadTitle = '';
  uploadCategory = 'Legal Filing';
  selectedFile: File | null = null;

  constructor(
    private advocateApi: AdvocateApiService,
    private docService: DocumentNotificationService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.reqDocForm = this.fb.group({
      caseId: [null, Validators.required],
      title: ['', Validators.required],
      category: ['Revenue Record', Validators.required],
      dueDate: [new Date().toISOString().substring(0, 10)],
      description: ['']
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.advocateApi.getDocuments().subscribe(list => (this.documents = list));
    this.advocateApi.getCases().subscribe(list => (this.cases = list));
  }

  requestDocument(): void {
    if (this.reqDocForm.invalid) return;
    this.advocateApi.requestRequiredDocument(this.reqDocForm.value).subscribe(() => {
      this.snackBar.open('Document requirement sent to client', 'Close', { duration: 3000 });
      this.showRequestForm = false;
      this.loadData();
    });
  }

  onFilePicked(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  uploadNow(): void {
    if (!this.selectedFile || !this.uploadCaseId) return;
    const fd = new FormData();
    fd.append('caseId', String(this.uploadCaseId));
    fd.append('title', this.uploadTitle || this.selectedFile.name);
    fd.append('category', this.uploadCategory);
    fd.append('file', this.selectedFile);

    this.docService.uploadDocument(fd).subscribe({
      next: () => {
        this.snackBar.open('Document stored in MinIO and linked to case', 'Close', { duration: 3000 });
        this.showUploadForm = false;
        this.selectedFile = null;
        this.uploadTitle = '';
        this.loadData();
      },
      error: err => this.snackBar.open(err.error?.message || 'Upload failed', 'Close', { duration: 4000 })
    });
  }

  verify(d: DocumentModel, decision: DocumentStatus): void {
    if (!d.id) return;
    const remarks = decision === 'VERIFIED'
      ? 'Verified and accepted by Advocate'
      : 'Rejected: Please upload a clearer certified copy';
    this.advocateApi.verifyOrRejectDocument(d.id, decision, remarks).subscribe(() => {
      this.snackBar.open(`Document marked as ${decision}`, 'Close', { duration: 3000 });
      this.loadData();
    });
  }

  download(d: DocumentModel): void {
    if (d.id && d.fileName) {
      this.docService.downloadDocument(d.id, d.fileName);
    }
  }
}
