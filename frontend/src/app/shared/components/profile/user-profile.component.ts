import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';
import { UserProfile } from '../../../core/models/caseflow.models';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSnackBarModule],
  template: `
    <div class="cf-page-container">
      <div class="cf-page-header">
        <div>
          <h1 class="cf-page-title">Account Profile & Settings</h1>
          <p class="cf-page-subtitle">Manage your personal and professional contact particulars.</p>
        </div>
      </div>

      <div class="cf-card" style="max-width: 680px;" *ngIf="profile">
        <form [formGroup]="profileForm" (ngSubmit)="save()">
          <div class="cf-form-grid">
            <mat-form-field appearance="outline">
              <mat-label>Full Name</mat-label>
              <input matInput formControlName="fullName">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Phone Number</mat-label>
              <input matInput formControlName="phone">
            </mat-form-field>

            <mat-form-field appearance="outline" *ngIf="profile.role === 'ADVOCATE'">
              <mat-label>Bar Registration Number</mat-label>
              <input matInput formControlName="barRegistrationNo">
            </mat-form-field>

            <mat-form-field appearance="outline" *ngIf="profile.role === 'ADVOCATE'">
              <mat-label>Legal Specialization</mat-label>
              <input matInput formControlName="specialization">
            </mat-form-field>

            <mat-form-field appearance="outline" *ngIf="profile.role === 'CLIENT'" style="grid-column: 1 / -1;">
              <mat-label>Company / Organization</mat-label>
              <input matInput formControlName="companyOrOrganization">
            </mat-form-field>

            <mat-form-field appearance="outline" *ngIf="profile.role === 'CLIENT'" style="grid-column: 1 / -1;">
              <mat-label>Address</mat-label>
              <input matInput formControlName="address">
            </mat-form-field>
          </div>
          <button mat-flat-button class="cf-btn-primary" type="submit">Save Profile Changes</button>
        </form>
      </div>
    </div>
  `
})
export class UserProfileComponent implements OnInit {
  profile: UserProfile | null = null;
  profileForm: FormGroup;

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.profileForm = this.fb.group({
      fullName: ['', Validators.required],
      phone: ['', Validators.required],
      barRegistrationNo: [''],
      specialization: [''],
      companyOrOrganization: [''],
      address: ['']
    });
  }

  ngOnInit(): void {
    this.authService.getProfile().subscribe(p => {
      this.profile = p;
      this.profileForm.patchValue(p);
    });
  }

  save(): void {
    this.authService.updateProfile(this.profileForm.value).subscribe(updated => {
      this.profile = updated;
      this.snackBar.open('Profile updated successfully', 'Close', { duration: 3000 });
    });
  }
}
