import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ClientApiService } from '../../../core/services/client-api.service';
import { ClientRequestModel } from '../../../core/models/caseflow.models';

@Component({
  selector: 'app-client-requests',
  standalone: true,
  imports: [CommonModule, FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSnackBarModule],
  template: `
    <div class="cf-page-container">
      <div class="cf-page-header">
        <div>
          <h1 class="cf-page-title">Advocate Requests & Follow-Ups</h1>
          <p class="cf-page-subtitle">Review instructions from your advocate and submit requested information or clarifications.</p>
        </div>
      </div>

      <div class="cf-card" *ngFor="let r of requests">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <div>
            <span class="cf-badge badge-blue" style="margin-right: 8px;">{{ r.caseNumber }}</span>
            <span class="cf-badge badge-lavender">{{ r.requestType }}</span>
          </div>
          <span class="cf-badge" [ngClass]="{
            'badge-peach': r.status === 'PENDING_CLIENT',
            'badge-blue': r.status === 'SUBMITTED_BY_CLIENT',
            'badge-mint': r.status === 'APPROVED',
            'badge-blush': r.status === 'NEEDS_REVISION'
          }">{{ r.status }}</span>
        </div>

        <h3 style="margin: 6px 0;">{{ r.title }}</h3>
        <p style="font-size: 14px; color: var(--cf-text-secondary); margin-bottom: 10px;">{{ r.instructions }}</p>
        <div style="font-size: 12px; color: var(--cf-text-secondary); margin-bottom: 12px;">
          Due Date: <strong>{{ r.dueDate | date:'dd MMM yyyy' }}</strong>
        </div>

        <div *ngIf="r.advocateReviewNotes" style="background: #FFF4EC; padding: 10px 14px; border-radius: 8px; margin-bottom: 12px; font-size: 13px;">
          <strong>Advocate Review Notes:</strong> {{ r.advocateReviewNotes }}
        </div>

        <div *ngIf="r.clientResponse" style="background: #F4F8FF; padding: 10px 14px; border-radius: 8px; margin-bottom: 12px; font-size: 13px;">
          <strong>Your Submitted Response:</strong> {{ r.clientResponse }}
        </div>

        <div *ngIf="r.status === 'PENDING_CLIENT' || r.status === 'NEEDS_REVISION'">
          <mat-form-field appearance="outline" style="width: 100%;">
            <mat-label>Type your response / requested details</mat-label>
            <textarea matInput rows="2" [(ngModel)]="responseDrafts[r.id!]"></textarea>
          </mat-form-field>
          <button mat-flat-button class="cf-btn-primary" (click)="submit(r)">Submit Response to Advocate</button>
        </div>
      </div>
    </div>
  `
})
export class ClientRequestsComponent implements OnInit {
  requests: ClientRequestModel[] = [];
  responseDrafts: { [key: number]: string } = {};

  constructor(private clientApi: ClientApiService, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests(): void {
    this.clientApi.getMyRequests().subscribe(list => (this.requests = list));
  }

  submit(r: ClientRequestModel): void {
    if (!r.id) return;
    const text = this.responseDrafts[r.id];
    if (!text || !text.trim()) return;
    this.clientApi.submitResponse(r.id, text).subscribe(() => {
      this.snackBar.open('Response submitted to your advocate', 'Close', { duration: 3000 });
      this.loadRequests();
    });
  }
}
