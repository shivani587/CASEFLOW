import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AdvocateApiService } from '../../../core/services/advocate-api.service';
import { ClientModel } from '../../../core/models/caseflow.models';

@Component({
  selector: 'app-advocate-clients',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule
  ],
  template: `
    <div class="cf-page-container">
      <div class="cf-page-header">
        <div>
          <h1 class="cf-page-title">Client Directory & Portal Accounts</h1>
          <p class="cf-page-subtitle">Manage clients, contact details, KYC references, and associated CASEFLOW client portal credentials.</p>
        </div>
        <button mat-flat-button class="cf-btn-primary" (click)="toggleForm()">
          <mat-icon>{{ showForm ? 'close' : 'person_add' }}</mat-icon>
          {{ showForm ? 'Cancel' : 'Add New Client' }}
        </button>
      </div>

      <div class="cf-card" *ngIf="showForm">
        <h3 style="margin-top: 0;">{{ editingId ? 'Update Client Profile' : 'Onboard New Client' }}</h3>
        <form [formGroup]="clientForm" (ngSubmit)="saveClient()">
          <div class="cf-form-grid">
            <mat-form-field appearance="outline">
              <mat-label>Full Name</mat-label>
              <input matInput formControlName="fullName">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Email Address (Client Portal Login)</mat-label>
              <input matInput type="email" formControlName="email">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Phone Number</mat-label>
              <input matInput formControlName="phone">
            </mat-form-field>

            <mat-form-field appearance="outline" *ngIf="!editingId">
              <mat-label>Initial Portal Password</mat-label>
              <input matInput formControlName="portalPassword" placeholder="Default: Client@123">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Company / Organization</mat-label>
              <input matInput formControlName="companyOrOrganization">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>ID / PAN / CIN Reference</mat-label>
              <input matInput formControlName="identificationReference">
            </mat-form-field>

            <mat-form-field appearance="outline" style="grid-column: 1 / -1;">
              <mat-label>Residential / Registered Office Address</mat-label>
              <input matInput formControlName="address">
            </mat-form-field>

            <mat-form-field appearance="outline" style="grid-column: 1 / -1;">
              <mat-label>Advocate Retainer & Background Notes</mat-label>
              <textarea matInput rows="2" formControlName="notes"></textarea>
            </mat-form-field>
          </div>
          <div style="display: flex; justify-content: flex-end; gap: 10px;">
            <button mat-button type="button" (click)="toggleForm()">Cancel</button>
            <button mat-flat-button class="cf-btn-primary" type="submit" [disabled]="clientForm.invalid">Save Client</button>
          </div>
        </form>
      </div>

      <div class="cf-card">
        <table class="cf-table">
          <thead>
            <tr>
              <th>Client Name & Organization</th>
              <th>Email & Phone</th>
              <th>ID Reference</th>
              <th>Address</th>
              <th>Assigned Cases</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let c of clients">
              <td>
                <div style="font-weight: 700; color: var(--cf-navy);">{{ c.fullName }}</div>
                <div style="font-size: 12px; color: var(--cf-text-secondary);">{{ c.companyOrOrganization || 'Individual Petitioner' }}</div>
              </td>
              <td>
                <div>{{ c.email }}</div>
                <div style="font-size: 12px; color: var(--cf-text-secondary);">{{ c.phone }}</div>
              </td>
              <td><span class="cf-badge badge-lavender">{{ c.identificationReference || 'Verified' }}</span></td>
              <td style="max-width: 260px;">{{ c.address }}</td>
              <td><span class="cf-badge badge-blue">{{ c.assignedCasesCount }} Cases</span></td>
              <td>
                <button mat-icon-button (click)="editClient(c)"><mat-icon>edit</mat-icon></button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class AdvocateClientsComponent implements OnInit {
  clients: ClientModel[] = [];
  showForm = false;
  editingId: number | null = null;
  clientForm: FormGroup;

  constructor(
    private advocateApi: AdvocateApiService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.clientForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      portalPassword: ['Client@123'],
      companyOrOrganization: [''],
      identificationReference: [''],
      address: [''],
      notes: [''],
      active: [true]
    });
  }

  ngOnInit(): void {
    this.loadClients();
  }

  loadClients(): void {
    this.advocateApi.getClients().subscribe(list => (this.clients = list));
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.editingId = null;
      this.clientForm.reset({ portalPassword: 'Client@123', active: true });
    }
  }

  editClient(c: ClientModel): void {
    this.editingId = c.id || null;
    this.showForm = true;
    this.clientForm.patchValue(c);
  }

  saveClient(): void {
    if (this.clientForm.invalid) return;
    const payload: ClientModel = this.clientForm.value;
    if (this.editingId) {
      this.advocateApi.updateClient(this.editingId, payload).subscribe({
        next: () => {
          this.snackBar.open('Client profile updated', 'Close', { duration: 3000 });
          this.toggleForm();
          this.loadClients();
        }
      });
    } else {
      this.advocateApi.createClient(payload).subscribe({
        next: () => {
          this.snackBar.open('Client onboarded and portal account provisioned', 'Close', { duration: 3000 });
          this.toggleForm();
          this.loadClients();
        },
        error: err => this.snackBar.open(err.error?.message || 'Error creating client', 'Close', { duration: 4000 })
      });
    }
  }
}
