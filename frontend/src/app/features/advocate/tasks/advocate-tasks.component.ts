import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AdvocateApiService } from '../../../core/services/advocate-api.service';
import { LegalCaseModel, TaskModel } from '../../../core/models/caseflow.models';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-advocate-tasks',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  template: `
    <div class="cf-page-container">
      <div class="cf-page-header">
        <div>
          <h1 class="cf-page-title">Advocate Tasks & Action Tracker</h1>
          <p class="cf-page-subtitle">Prioritize legal drafting, research, registry filings, and overdue action items.</p>
        </div>
        <button mat-flat-button class="cf-btn-primary" (click)="toggleForm()">
          <mat-icon>{{ showForm ? 'close' : 'add_task' }}</mat-icon>
          {{ showForm ? 'Cancel' : 'Create Task' }}
        </button>
      </div>

      <div class="cf-card" *ngIf="showForm">
        <h3 style="margin-top: 0;">{{ editingId ? 'Update Task' : 'Create New Case Task' }}</h3>
        <form [formGroup]="taskForm" (ngSubmit)="saveTask()">
          <div class="cf-form-grid">
            <mat-form-field appearance="outline">
              <mat-label>Associated Case</mat-label>
              <mat-select formControlName="caseId">
                <mat-option *ngFor="let c of cases" [value]="c.id">{{ c.caseNumber }} — {{ c.title }}</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Task Title</mat-label>
              <input matInput formControlName="title">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Priority Level</mat-label>
              <mat-select formControlName="priority">
                <mat-option value="LOW">LOW</mat-option>
                <mat-option value="MEDIUM">MEDIUM</mat-option>
                <mat-option value="HIGH">HIGH</mat-option>
                <mat-option value="URGENT">URGENT</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Status</mat-label>
              <mat-select formControlName="status">
                <mat-option value="PENDING">PENDING</mat-option>
                <mat-option value="IN_PROGRESS">IN_PROGRESS</mat-option>
                <mat-option value="COMPLETED">COMPLETED</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Due Date</mat-label>
              <input matInput type="date" formControlName="dueDate">
            </mat-form-field>

            <mat-form-field appearance="outline" style="grid-column: 1 / -1;">
              <mat-label>Task Description & Checklist</mat-label>
              <textarea matInput rows="2" formControlName="description"></textarea>
            </mat-form-field>
          </div>
          <div style="display: flex; justify-content: flex-end; gap: 10px;">
            <button mat-button type="button" (click)="toggleForm()">Cancel</button>
            <button mat-flat-button class="cf-btn-primary" type="submit" [disabled]="taskForm.invalid">Save Task</button>
          </div>
        </form>
      </div>

      <div class="cf-card">
        <table class="cf-table">
          <thead>
            <tr>
              <th>Task & Description</th>
              <th>Case</th>
              <th>Priority</th>
              <th>Due Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let t of tasks">
              <td>
                <div style="font-weight: 700; color: var(--cf-navy);">{{ t.title }}</div>
                <div style="font-size: 12px; color: var(--cf-text-secondary);">{{ t.description }}</div>
              </td>
              <td><span class="cf-badge badge-blue">{{ t.caseNumber }}</span></td>
              <td>
                <span class="cf-badge" [ngClass]="t.priority === 'URGENT' ? 'badge-blush' : (t.priority === 'HIGH' ? 'badge-peach' : 'badge-lavender')">
                  {{ t.priority }}
                </span>
              </td>
              <td>{{ t.dueDate | date:'dd MMM yyyy' }}</td>
              <td>
                <span class="cf-badge" [ngClass]="t.status === 'COMPLETED' ? 'badge-mint' : (t.overdue ? 'badge-blush' : 'badge-blue')">
                  {{ t.status }}
                </span>
              </td>
              <td>
                <button mat-stroked-button class="cf-btn-outline" *ngIf="t.status !== 'COMPLETED'" (click)="markCompleted(t)" style="margin-right: 6px;">
                  Complete
                </button>
                <button mat-icon-button (click)="editTask(t)"><mat-icon>edit</mat-icon></button>
                <button mat-icon-button color="warn" (click)="confirmDelete(t)"><mat-icon>delete_outline</mat-icon></button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class AdvocateTasksComponent implements OnInit {
  tasks: TaskModel[] = [];
  cases: LegalCaseModel[] = [];
  showForm = false;
  editingId: number | null = null;
  taskForm: FormGroup;

  constructor(
    private advocateApi: AdvocateApiService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.taskForm = this.fb.group({
      caseId: [null, Validators.required],
      title: ['', Validators.required],
      priority: ['HIGH', Validators.required],
      status: ['PENDING', Validators.required],
      dueDate: [new Date().toISOString().substring(0, 10), Validators.required],
      description: ['']
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.advocateApi.getTasks().subscribe(list => (this.tasks = list));
    this.advocateApi.getCases().subscribe(list => (this.cases = list));
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.editingId = null;
      this.taskForm.reset({
        priority: 'HIGH',
        status: 'PENDING',
        dueDate: new Date().toISOString().substring(0, 10)
      });
    }
  }

  editTask(t: TaskModel): void {
    this.editingId = t.id || null;
    this.showForm = true;
    this.taskForm.patchValue(t);
  }

  markCompleted(t: TaskModel): void {
    if (!t.id) return;
    this.advocateApi.updateTask(t.id, { ...t, status: 'COMPLETED' }).subscribe(() => {
      this.snackBar.open('Task marked as completed', 'Close', { duration: 3000 });
      this.loadData();
    });
  }

  confirmDelete(t: TaskModel): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Delete Task', message: `Are you sure you want to delete "${t.title}"?` }
    });
    ref.afterClosed().subscribe(ok => {
      if (ok && t.id) {
        this.advocateApi.deleteTask(t.id).subscribe(() => {
          this.snackBar.open('Task deleted', 'Close', { duration: 3000 });
          this.loadData();
        });
      }
    });
  }

  saveTask(): void {
    if (this.taskForm.invalid) return;
    const payload: TaskModel = this.taskForm.value;
    if (this.editingId) {
      this.advocateApi.updateTask(this.editingId, payload).subscribe(() => {
        this.snackBar.open('Task updated', 'Close', { duration: 3000 });
        this.toggleForm();
        this.loadData();
      });
    } else {
      this.advocateApi.createTask(payload).subscribe(() => {
        this.snackBar.open('Task created', 'Close', { duration: 3000 });
        this.toggleForm();
        this.loadData();
      });
    }
  }
}
