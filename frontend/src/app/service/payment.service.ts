import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';

export interface PaymentPayload {
  requestId?: number;   // <-- optional requestId
  farmerId?: number;
  dealerId?: number;
  cropId?: number;
  amount: number;
  status?: string;
}

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private base = `${environment.apiBaseUrl}/payments`;

  constructor(private http: HttpClient, private auth: AuthService) {}

  private get headers() {
    const token = this.auth.token;
    return token
      ? { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) }
      : {};
  }

  /** POST -> http://localhost:8080/api/payments */
  makePayment(payload: PaymentPayload): Observable<any> {
  return this.http.post<any>(`${this.base}`, payload, this.headers);
}

  getPaymentsForDealer(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/dealer/my`, this.headers);
  }

  getPaymentsForFarmer(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/farmer/my`, this.headers);
  }

  getAllPayments(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/all`, this.headers);
  }
}
