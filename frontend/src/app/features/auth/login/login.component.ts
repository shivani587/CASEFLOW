import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule
  ],
  template: `
    <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #F0F5FC 0%, #F8F7FF 100%); padding: 24px;">
      <div class="cf-card" style="max-width: 440px; width: 100%; padding: 36px 32px; box-shadow: var(--cf-shadow-md);">
        <div style="text-align: center; margin-bottom: 28px;">
          <div style="display: inline-flex; align-items: center; justify-content: center; width: 56px; height: 56px; border-radius: 14px; background: var(--cf-pastel-blue); color: var(--cf-navy); margin-bottom: 12px;">
            <mat-icon style="font-size: 30px; width: 30px; height: 30px;">balance</mat-icon>
          </div>
          <h1 style="font-size: 26px; font-weight: 800; letter-spacing: 0.8px; margin: 0; color: var(--cf-navy);">CASEFLOW</h1>
          <p style="font-size: 13px; color: var(--cf-muted-blue); font-weight: 600; margin: 4px 0 0 0;">Simplify Cases. Strengthen Justice.</p>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <mat-form-field appearance="outline" style="width: 100%; margin-bottom: 8px;">
            <mat-label>Email Address</mat-label>
            <input matInput type="email" formControlName="email" placeholder="advocate@caseflow.legal">
            <mat-icon matSuffix>mail_outline</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline" style="width: 100%; margin-bottom: 16px;">
            <mat-label>Password</mat-label>
            <input matInput [type]="hidePassword ? 'password' : 'text'" formControlName="password">
            <button mat-icon-button matSuffix type="button" (click)="hidePassword = !hidePassword">
              <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
            </button>
          </mat-form-field>

          <button mat-flat-button class="cf-btn-primary" style="width: 100%; height: 46px; font-size: 15px;" type="submit" [disabled]="loading || loginForm.invalid">
            {{ loading ? 'Signing in...' : 'Sign In to CASEFLOW' }}
          </button>
        </form>

        <div style="margin-top: 22px; padding-top: 18px; border-top: 1px solid var(--cf-border);">
          <div style="font-size: 12px; color: var(--cf-text-secondary); margin-bottom: 10px; font-weight: 600;">QUICK DEMO CREDENTIALS:</div>
          <div style="display: flex; gap: 10px;">
            <button mat-stroked-button type="button" class="cf-btn-outline" style="flex: 1; font-size: 12px;" (click)="fillDemo('ADVOCATE')">
              Advocate Portal
            </button>
            <button mat-stroked-button type="button" class="cf-btn-outline" style="flex: 1; font-size: 12px;" (click)="fillDemo('CLIENT')">
              Client Portal
            </button>
          </div>
        </div>

        <p style="text-align: center; margin-top: 20px; font-size: 13px; color: var(--cf-text-secondary);">
          Don't have an account? <a routerLink="/register" style="color: var(--cf-navy); font-weight: 600; text-decoration: none;">Register Account</a>
        </p>
      </div>
    </div>
  `
})
export class LoginComponent {
  loginForm: FormGroup;
  hidePassword = true;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  fillDemo(role: 'ADVOCATE' | 'CLIENT'): void {
    if (role === 'ADVOCATE') {
      this.loginForm.patchValue({ email: 'advocate@caseflow.legal', password: 'Advocate@123' });
    } else {
      this.loginForm.patchValue({ email: 'client@caseflow.legal', password: 'Client@123' });
    }
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;
    this.loading = true;
    this.authService.login(this.loginForm.value).subscribe({
      next: res => {
        this.loading = false;
        if (res.role === 'ADVOCATE') {
          this.router.navigate(['/advocate/dashboard']);
        } else {
          this.router.navigate(['/client/dashboard']);
        }
      },
      error: err => {
        this.loading = false;
        this.snackBar.open(err.error?.message || 'Invalid login credentials', 'Close', { duration: 4000 });
      }
    });
  }
}
