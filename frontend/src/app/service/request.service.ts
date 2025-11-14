import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export type RequestStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED';

export interface CropRequest {
  id?: number;
  cropId: number;
  cropName?: string;
  farmerId?: number;
  dealerId?: number;
  offeredPrice?: number;
  quantity?: number;
  pricePerUnit?: number;
  totalAmount?: number;
  status?: RequestStatus;
  createdAt?: string;
  completedAt?: string;
}

@Injectable({ providedIn: 'root' })
export class RequestService {
  private base = `${environment.apiBaseUrl}/requests`;
  private paymentsBase = `${environment.apiBaseUrl}/payments`;

  constructor(private http: HttpClient, private auth: AuthService) {}

  private get headers() {
    // Compose headers required by backend: X-User-Id, X-User-Role and Authorization (if present)
    const token = this.auth.token;
    const user = this.auth.user ?? {};
    const headersObj: Record<string, string> = {
      'X-User-Id': user?.userId ? String(user.userId) : (user?.id ? String(user.id) : '')
    };
    if (user?.role) headersObj['X-User-Role'] = String(user.role);
    if (token) headersObj['Authorization'] = `Bearer ${token}`;

    // remove empty values
    Object.keys(headersObj).forEach(k => {
      if (!headersObj[k]) delete headersObj[k];
    });

    return { headers: new HttpHeaders(headersObj) };
  }

  /** Dealer creates a new request */
  createRequest(cropId: number, offeredPrice: number, quantity: number): Observable<any> {
    const body = { cropId, offeredPrice, quantity };
    return this.http.post(`${this.base}`, body, this.headers);
  }

  /** Get requests for current user (uses X-User headers) */
  getMyRequests(): Observable<CropRequest[]> {
    return this.http.get<CropRequest[]>(`${this.base}/my`, this.headers);
  }

  /** Alias for Dealer dashboards (keeps older component calls working) */
  myAsDealer(): Observable<CropRequest[]> {
    return this.getMyRequests();
  }

  /** Get requests for a specific farmer (server endpoint exists /requests/farmer/{id}) */
  getRequestsForFarmer(farmerId: number): Observable<CropRequest[]> {
    // use auth headers too (if available) to keep gateway/auth happy
    return this.http.get<CropRequest[]>(`${this.base}/farmer/${farmerId}`, this.headers);
  }

  /** Update request status via path endpoint (PUT /requests/{id}/status/{status}) */
  updateStatus(id: number, status: RequestStatus): Observable<any> {
    // backend expects status in path per controller, send empty body
    return this.http.put(`${this.base}/${id}/status/${status}`, {}, this.headers);
  }

  /** Mark request as completed (used by dealer or farmer) */
  completeRequest(id: number, pricePerUnit: number): Observable<any> {
    const params = { pricePerUnit: pricePerUnit.toString() };
    // For query params we add them via options; merge headers
    const options = { ...this.headers, params };
    return this.http.put(`${this.base}/${id}/complete`, {}, options);
  }

  /** Dealer makes payment */
// src/app/service/request.service.ts (makePayment)
makePayment(request: CropRequest | any): Observable<any> {
  const amount =
    request.totalAmount ||
    (request.offeredPrice || request.pricePerUnit || 0) * (request.quantity || 0);

  const body = {
    requestId: request.id,      
    farmerId: request.farmerId,
    dealerId: request.dealerId,
    cropId: request.cropId,
    amount,
    status: 'SUCCESS'
  };

  return this.http.post(`${this.paymentsBase}`, body);
}


  /** Dealer payment history */
  getDealerPayments(): Observable<any[]> {
    return this.http.get<any[]>(`${this.paymentsBase}/dealer/my`, this.headers);
  }
}
