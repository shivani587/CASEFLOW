import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
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
    <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #F0F5FC 0%, #F8F7FF 100%); padding: 24px;">
      <div class="cf-card" style="max-width: 540px; width: 100%; padding: 32px; box-shadow: var(--cf-shadow-md);">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="font-size: 24px; font-weight: 800; color: var(--cf-navy); margin: 0;">Create CASEFLOW Account</h1>
          <p style="font-size: 13px; color: var(--cf-text-secondary); margin-top: 4px;">Advocate Case Follow-Up & Action Management Platform</p>
        </div>

        <form [formGroup]="regForm" (ngSubmit)="onSubmit()">
          <div class="cf-form-grid">
            <mat-form-field appearance="outline">
              <mat-label>Full Name</mat-label>
              <input matInput formControlName="fullName">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Role</mat-label>
              <mat-select formControlName="role">
                <mat-option value="ADVOCATE">Advocate</mat-option>
                <mat-option value="CLIENT">Client</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Email Address</mat-label>
              <input matInput type="email" formControlName="email">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Phone Number</mat-label>
              <input matInput formControlName="phone">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Password</mat-label>
              <input matInput type="password" formControlName="password">
            </mat-form-field>

            <mat-form-field appearance="outline" *ngIf="regForm.get('role')?.value === 'ADVOCATE'">
              <mat-label>Bar Council Reg. No.</mat-label>
              <input matInput formControlName="barRegistrationNo">
            </mat-form-field>

            <mat-form-field appearance="outline" *ngIf="regForm.get('role')?.value === 'ADVOCATE'" style="grid-column: 1 / -1;">
              <mat-label>Legal Specialization</mat-label>
              <input matInput formControlName="specialization">
            </mat-form-field>

            <mat-form-field appearance="outline" *ngIf="regForm.get('role')?.value === 'CLIENT'" style="grid-column: 1 / -1;">
              <mat-label>Address / Organization</mat-label>
              <input matInput formControlName="address">
            </mat-form-field>
          </div>

          <button mat-flat-button class="cf-btn-primary" style="width: 100%; height: 46px; margin-top: 12px;" type="submit" [disabled]="loading || regForm.invalid">
            {{ loading ? 'Creating Account...' : 'Complete Registration' }}
          </button>
        </form>

        <p style="text-align: center; margin-top: 18px; font-size: 13px; color: var(--cf-text-secondary);">
          Already registered? <a routerLink="/login" style="color: var(--cf-navy); font-weight: 600; text-decoration: none;">Sign In</a>
        </p>
      </div>
    </div>
  `
})
export class RegisterComponent {
  regForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.regForm = this.fb.group({
      fullName: ['', Validators.required],
      role: ['ADVOCATE', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      barRegistrationNo: [''],
      specialization: [''],
      address: ['']
    });
  }

  onSubmit(): void {
    if (this.regForm.invalid) return;
    this.loading = true;
    this.authService.register(this.regForm.value).subscribe({
      next: res => {
        this.loading = false;
        this.router.navigate([res.role === 'ADVOCATE' ? '/advocate/dashboard' : '/client/dashboard']);
      },
      error: err => {
        this.loading = false;
        this.snackBar.open(err.error?.message || 'Registration failed', 'Close', { duration: 4000 });
      }
    });
  }
}
