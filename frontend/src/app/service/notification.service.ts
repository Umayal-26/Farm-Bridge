import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private base = `${environment.apiBaseUrl}/notifications`;

  constructor(private http: HttpClient, private auth: AuthService) {}

  private get headers() {
    const token = this.auth.token;
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  }

  getMyNotifications(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}`, this.headers);
  }

  getUnread(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/unread`, this.headers);
  }

  markRead(id: number): Observable<void> {
    return this.http.patch<void>(`${this.base}/${id}/read`, {}, this.headers);
  }

  getAllNotifications(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/all`, this.headers);
  }

  // Optional convenience
  sendNotification(userId: number, message: string): Observable<any> {
    try {
      return this.http.post(`${this.base}`, { userId, message }, this.headers);
    } catch {
      return of(null);
    }
  }
}
