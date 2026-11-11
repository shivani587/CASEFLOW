import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { AuthService } from '../../../core/services/auth.service';
import { DocumentNotificationService } from '../../../core/services/document-notification.service';

@Component({
  selector: 'app-advocate-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatButtonModule, MatBadgeModule],
  template: `
    <div style="display: flex; min-height: 100vh; background-color: var(--cf-bg-main);">
      <!-- Sidebar -->
      <aside style="width: 260px; background: var(--cf-navy); color: #FFFFFF; display: flex; flex-direction: column; flex-shrink: 0;">
        <div style="padding: 22px 24px; border-bottom: 1px solid rgba(255,255,255,0.1);">
          <div style="display: flex; align-items: center; gap: 10px;">
            <mat-icon style="color: #A6C8FF;">balance</mat-icon>
            <div>
              <div style="font-size: 18px; font-weight: 800; letter-spacing: 0.6px;">CASEFLOW</div>
              <div style="font-size: 11px; color: #BFD7FF;">Advocate Workspace</div>
            </div>
          </div>
        </div>

        <nav style="flex: 1; padding: 16px 12px; display: flex; flex-direction: column; gap: 4px;">
          <a routerLink="/advocate/dashboard" routerLinkActive="active-nav" class="nav-link">
            <mat-icon>dashboard</mat-icon> <span>Action Dashboard</span>
          </a>
          <a routerLink="/advocate/cases" routerLinkActive="active-nav" class="nav-link">
            <mat-icon>folder_shared</mat-icon> <span>Case Management</span>
          </a>
          <a routerLink="/advocate/clients" routerLinkActive="active-nav" class="nav-link">
            <mat-icon>people</mat-icon> <span>Clients Directory</span>
          </a>
          <a routerLink="/advocate/hearings" routerLinkActive="active-nav" class="nav-link">
            <mat-icon>event_note</mat-icon> <span>Hearings & Calendar</span>
          </a>
          <a routerLink="/advocate/tasks" routerLinkActive="active-nav" class="nav-link">
            <mat-icon>task_alt</mat-icon> <span>Tasks & Deadlines</span>
          </a>
          <a routerLink="/advocate/documents" routerLinkActive="active-nav" class="nav-link">
            <mat-icon>description</mat-icon> <span>Documents & MinIO</span>
          </a>
          <a routerLink="/advocate/pending-actions" routerLinkActive="active-nav" class="nav-link">
            <mat-icon>pending_actions</mat-icon> <span>Pending Actions</span>
          </a>
          <a routerLink="/advocate/client-requests" routerLinkActive="active-nav" class="nav-link">
            <mat-icon>question_answer</mat-icon> <span>Client Follow-Ups</span>
          </a>
          <a routerLink="/advocate/notifications" routerLinkActive="active-nav" class="nav-link">
            <mat-icon>notifications</mat-icon>
            <span>Notifications</span>
            <span *ngIf="unreadCount > 0" style="margin-left: auto; background: #FF8A8A; color: #1E3A5F; font-weight: 700; font-size: 11px; padding: 2px 8px; border-radius: 10px;">
              {{ unreadCount }}
            </span>
          </a>
          <a routerLink="/advocate/profile" routerLinkActive="active-nav" class="nav-link">
            <mat-icon>manage_accounts</mat-icon> <span>Profile & Settings</span>
          </a>
        </nav>

        <div style="padding: 16px; border-top: 1px solid rgba(255,255,255,0.1);">
          <div style="font-size: 13px; font-weight: 600;">{{ authService.currentUser?.fullName }}</div>
          <div style="font-size: 11px; color: #BFD7FF; margin-bottom: 10px;">{{ authService.currentUser?.email }}</div>
          <button mat-stroked-button style="width: 100%; color: #FFFFFF; border-color: rgba(255,255,255,0.3);" (click)="authService.logout()">
            <mat-icon>logout</mat-icon> Sign Out
          </button>
        </div>
      </aside>

      <!-- Main Area -->
      <div style="flex: 1; display: flex; flex-direction: column; overflow-x: hidden;">
        <header style="height: 64px; background: #FFFFFF; border-bottom: 1px solid var(--cf-border); display: flex; align-items: center; justify-content: space-between; padding: 0 32px;">
          <div style="font-size: 14px; color: var(--cf-text-secondary); font-weight: 500;">
            Simplify Cases. Strengthen Justice.
          </div>
          <div style="display: flex; align-items: center; gap: 16px;">
            <a routerLink="/advocate/notifications" style="color: var(--cf-navy); text-decoration: none; display: flex; align-items: center;">
              <mat-icon [matBadge]="unreadCount > 0 ? unreadCount : null" matBadgeColor="warn">notifications_none</mat-icon>
            </a>
            <span class="cf-badge badge-blue">ADVOCATE PORTAL</span>
          </div>
        </header>

        <main style="flex: 1;">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .nav-link {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 11px 14px;
      color: rgba(255, 255, 255, 0.82);
      text-decoration: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      transition: background 0.15s, color 0.15s;
    }
    .nav-link:hover {
      background: rgba(255, 255, 255, 0.08);
      color: #FFFFFF;
    }
    .active-nav {
      background: rgba(255, 255, 255, 0.16) !important;
      color: #FFFFFF !important;
      font-weight: 600;
    }
  `]
})
export class AdvocateLayoutComponent implements OnInit {
  unreadCount = 0;

  constructor(
    public authService: AuthService,
    private docNotifService: DocumentNotificationService
  ) {}

  ngOnInit(): void {
    this.docNotifService.unreadCount$.subscribe(count => (this.unreadCount = count));
  }
}
