import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DocumentNotificationService } from '../../../core/services/document-notification.service';
import { NotificationModel } from '../../../core/models/caseflow.models';

@Component({
  selector: 'app-notification-panel',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  template: `
    <div class="cf-page-container">
      <div class="cf-page-header">
        <div>
          <h1 class="cf-page-title">Real-Time Notifications & Alerts</h1>
          <p class="cf-page-subtitle">Instant WebSocket STOMP alerts and historical notifications for hearings, tasks, documents, and case updates.</p>
        </div>
        <button mat-stroked-button class="cf-btn-outline" (click)="markAllRead()">
          <mat-icon>done_all</mat-icon> Mark All as Read
        </button>
      </div>

      <div class="cf-card">
        <div *ngIf="notifications.length === 0" class="cf-empty-state">
          <mat-icon>notifications_off</mat-icon>
          <div>No notifications recorded yet.</div>
        </div>

        <div *ngFor="let n of notifications"
             [style.background]="n.read ? '#FFFFFF' : '#F4F8FF'"
             style="padding: 16px; border-bottom: 1px solid var(--cf-border); display: flex; justify-content: space-between; align-items: center; gap: 16px; border-radius: 8px; margin-bottom: 6px;">
          <div>
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
              <span class="cf-badge badge-blue">{{ n.type }}</span>
              <span class="cf-badge badge-lavender" *ngIf="n.caseNumber">{{ n.caseNumber }}</span>
              <span style="font-weight: 700; color: var(--cf-navy); font-size: 15px;">{{ n.title }}</span>
            </div>
            <p style="margin: 4px 0; font-size: 14px; color: var(--cf-text-primary);">{{ n.message }}</p>
            <div style="font-size: 12px; color: var(--cf-text-secondary);">{{ n.createdAt | date:'dd MMM yyyy, hh:mm a' }}</div>
          </div>

          <button mat-stroked-button class="cf-btn-outline" *ngIf="!n.read" (click)="markRead(n)">
            Mark Read
          </button>
        </div>
      </div>
    </div>
  `
})
export class NotificationPanelComponent implements OnInit {
  notifications: NotificationModel[] = [];

  constructor(private docNotifService: DocumentNotificationService) {}

  ngOnInit(): void {
    this.docNotifService.notifications$.subscribe(list => (this.notifications = list));
    this.docNotifService.loadNotifications();
  }

  markRead(n: NotificationModel): void {
    this.docNotifService.markAsRead(n.id).subscribe();
  }

  markAllRead(): void {
    this.docNotifService.markAllAsRead().subscribe();
  }
}
