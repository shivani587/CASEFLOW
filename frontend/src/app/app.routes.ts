import { Routes } from '@angular/router';
import { advocateGuard, clientGuard } from './core/guards/auth.guard';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { AdvocateLayoutComponent } from './features/advocate/layout/advocate-layout.component';
import { AdvocateDashboardComponent } from './features/advocate/dashboard/advocate-dashboard.component';
import { AdvocateCasesComponent } from './features/advocate/cases/advocate-cases.component';
import { AdvocateCaseDetailComponent } from './features/advocate/case-detail/advocate-case-detail.component';
import { AdvocateClientsComponent } from './features/advocate/clients/advocate-clients.component';
import { AdvocateHearingsComponent } from './features/advocate/hearings/advocate-hearings.component';
import { AdvocateTasksComponent } from './features/advocate/tasks/advocate-tasks.component';
import { AdvocateDocumentsComponent } from './features/advocate/documents/advocate-documents.component';
import { AdvocatePendingActionsComponent } from './features/advocate/pending-actions/advocate-pending-actions.component';
import { AdvocateClientRequestsComponent } from './features/advocate/client-requests/advocate-client-requests.component';
import { NotificationPanelComponent } from './shared/components/notification-panel/notification-panel.component';
import { UserProfileComponent } from './shared/components/profile/user-profile.component';
import { ClientLayoutComponent } from './features/client/layout/client-layout.component';
import { ClientDashboardComponent } from './features/client/dashboard/client-dashboard.component';
import { ClientMyCasesComponent } from './features/client/my-cases/client-my-cases.component';
import { ClientCaseProgressComponent } from './features/client/case-progress/client-case-progress.component';
import { ClientHearingsComponent } from './features/client/hearings/client-hearings.component';
import { ClientDocumentsComponent } from './features/client/documents/client-documents.component';
import { ClientRequestsComponent } from './features/client/requests/client-requests.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: 'advocate',
    component: AdvocateLayoutComponent,
    canActivate: [advocateGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdvocateDashboardComponent },
      { path: 'cases', component: AdvocateCasesComponent },
      { path: 'cases/:id', component: AdvocateCaseDetailComponent },
      { path: 'clients', component: AdvocateClientsComponent },
      { path: 'hearings', component: AdvocateHearingsComponent },
      { path: 'tasks', component: AdvocateTasksComponent },
      { path: 'documents', component: AdvocateDocumentsComponent },
      { path: 'pending-actions', component: AdvocatePendingActionsComponent },
      { path: 'client-requests', component: AdvocateClientRequestsComponent },
      { path: 'notifications', component: NotificationPanelComponent },
      { path: 'profile', component: UserProfileComponent }
    ]
  },
  {
    path: 'client',
    component: ClientLayoutComponent,
    canActivate: [clientGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: ClientDashboardComponent },
      { path: 'my-cases', component: ClientMyCasesComponent },
      { path: 'my-cases/:id', component: ClientCaseProgressComponent },
      { path: 'hearings', component: ClientHearingsComponent },
      { path: 'documents', component: ClientDocumentsComponent },
      { path: 'requests', component: ClientRequestsComponent },
      { path: 'notifications', component: NotificationPanelComponent },
      { path: 'profile', component: UserProfileComponent }
    ]
  },
  { path: '**', redirectTo: 'login' }
];
