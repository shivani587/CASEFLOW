import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ClientApiService } from '../../../core/services/client-api.service';
import { DocumentNotificationService } from '../../../core/services/document-notification.service';
import { DocumentModel, LegalCaseModel } from '../../../core/models/caseflow.models';

@Component({
  selector: 'app-client-documents',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
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
          <h1 class="cf-page-title">Required Documents & Submissions</h1>
          <p class="cf-page-subtitle">Upload documents requested by your advocate and track verification status.</p>
        </div>
      </div>

      <!-- Upload Card -->
      <div class="cf-card">
        <h3 style="margin-top: 0;">Upload Requested or Supporting Document</h3>
        <div class="cf-form-grid">
          <mat-form-field appearance="outline">
            <mat-label>Select Case</mat-label>
            <mat-select [(ngModel)]="selectedCaseId">
              <mat-option *ngFor="let c of cases" [value]="c.id">{{ c.caseNumber }} — {{ c.title }}</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Fulfilling Requirement (Optional)</mat-label>
            <mat-select [(ngModel)]="selectedDocId">
              <mat-option [value]="null">-- New Supporting Document --</mat-option>
              <mat-option *ngFor="let d of requiredDocs()" [value]="d.id">{{ d.title }} ({{ d.caseNumber }})</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" *ngIf="!selectedDocId">
            <mat-label>Document Title</mat-label>
            <input matInput [(ngModel)]="customTitle">
          </mat-form-field>

          <div style="display: flex; align-items: center;">
            <input type="file" (change)="onFileSelected($event)" accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.txt">
          </div>
        </div>
        <button mat-flat-button class="cf-btn-primary" (click)="upload()" [disabled]="!selectedFile || !selectedCaseId">
          <mat-icon>cloud_upload</mat-icon> Submit Document for Advocate Verification
        </button>
      </div>

      <!-- Documents List -->
      <div class="cf-card">
        <table class="cf-table">
          <thead>
            <tr>
              <th>Document Title & Category</th>
              <th>Case</th>
              <th>Due Date</th>
              <th>Verification Status</th>
              <th>Advocate Remarks</th>
              <th>Download</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let d of documents">
              <td>
                <div style="font-weight: 700; color: var(--cf-navy);">{{ d.title }}</div>
                <div style="font-size: 12px; color: var(--cf-text-secondary);">{{ d.category }}</div>
              </td>
              <td><span class="cf-badge badge-blue">{{ d.caseNumber }}</span></td>
              <td>{{ d.dueDate | date:'dd MMM yyyy' }}</td>
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
                <button mat-stroked-button class="cf-btn-outline" *ngIf="d.fileName" (click)="download(d)">
                  <mat-icon>download</mat-icon> Download
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class ClientDocumentsComponent implements OnInit {
  documents: DocumentModel[] = [];
  cases: LegalCaseModel[] = [];
  selectedCaseId: number | null = null;
  selectedDocId: number | null = null;
  customTitle = '';
  selectedFile: File | null = null;

  constructor(
    private clientApi: ClientApiService,
    private docService: DocumentNotificationService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.clientApi.getMyDocuments().subscribe(list => (this.documents = list));
    this.clientApi.getMyCases().subscribe(list => {
      this.cases = list;
      if (list.length > 0 && !this.selectedCaseId) {
        this.selectedCaseId = list[0].id || null;
      }
    });
  }

  requiredDocs(): DocumentModel[] {
    return this.documents.filter(d => d.status === 'REQUIRED' || d.status === 'REJECTED');
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  upload(): void {
    if (!this.selectedFile || !this.selectedCaseId) return;
    const fd = new FormData();
    fd.append('caseId', String(this.selectedCaseId));
    if (this.selectedDocId) {
      fd.append('documentId', String(this.selectedDocId));
    } else {
      fd.append('title', this.customTitle || this.selectedFile.name);
      fd.append('category', 'Client Submission');
    }
    fd.append('file', this.selectedFile);

    this.docService.uploadDocument(fd).subscribe({
      next: () => {
        this.snackBar.open('Document uploaded to MinIO and sent for advocate verification', 'Close', { duration: 3500 });
        this.selectedFile = null;
        this.customTitle = '';
        this.selectedDocId = null;
        this.loadData();
      },
      error: err => this.snackBar.open(err.error?.message || 'Upload failed', 'Close', { duration: 4000 })
    });
  }

  download(d: DocumentModel): void {
    if (d.id && d.fileName) {
      this.docService.downloadDocument(d.id, d.fileName);
    }
  }
}
