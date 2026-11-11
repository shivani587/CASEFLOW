import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { environment } from '../../../environments/environment';
import { DocumentModel, NotificationModel } from '../models/caseflow.models';
import { AuthService } from './auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class DocumentNotificationService {
  private stompClient: Client | null = null;
  private notificationsSubject = new BehaviorSubject<NotificationModel[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.loadNotifications();
        this.connectWebSocket(user.userId);
      } else {
        this.disconnectWebSocket();
      }
    });
  }

  uploadDocument(formData: FormData): Observable<DocumentModel> {
    return this.http.post<DocumentModel>(`${environment.apiUrl}/documents/upload`, formData);
  }

  getCaseDocuments(caseId: number): Observable<DocumentModel[]> {
    return this.http.get<DocumentModel[]>(`${environment.apiUrl}/cases/${caseId}/documents`);
  }

  downloadDocument(documentId: number, fileName: string): void {
    this.http.get(`${environment.apiUrl}/documents/${documentId}/download`, { responseType: 'blob' })
      .subscribe(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName || 'caseflow-document.pdf';
        a.click();
        window.URL.revokeObjectURL(url);
      });
  }

  loadNotifications(): void {
    this.http.get<NotificationModel[]>(`${environment.apiUrl}/notifications`).subscribe({
      next: list => {
        this.notificationsSubject.next(list);
        this.unreadCountSubject.next(list.filter(n => !n.read).length);
      }
    });
  }

  markAsRead(id: number): Observable<NotificationModel> {
    return this.http.patch<NotificationModel>(`${environment.apiUrl}/notifications/${id}/read`, {}).pipe(
      tap(() => this.loadNotifications())
    );
  }

  markAllAsRead(): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/notifications/mark-all-read`, {}).pipe(
      tap(() => this.loadNotifications())
    );
  }

  private connectWebSocket(userId: number): void {
    this.disconnectWebSocket();
    this.stompClient = new Client({
      webSocketFactory: () => new SockJS(environment.wsUrl),
      reconnectDelay: 5000,
      onConnect: () => {
        this.stompClient?.subscribe(`/topic/notifications/${userId}`, message => {
          if (message.body) {
            const incoming: NotificationModel = JSON.parse(message.body);
            const current = this.notificationsSubject.value;
            this.notificationsSubject.next([incoming, ...current]);
            this.unreadCountSubject.next(this.unreadCountSubject.value + 1);
            this.snackBar.open(`🔔 ${incoming.title}`, 'Dismiss', { duration: 5000 });
          }
        });
      }
    });
    this.stompClient.activate();
  }

  private disconnectWebSocket(): void {
    if (this.stompClient) {
      this.stompClient.deactivate();
      this.stompClient = null;
    }
  }
}
