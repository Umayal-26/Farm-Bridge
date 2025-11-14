import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Crop } from '../models/crop.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class CropService {
  private baseUrl = `${environment.apiBaseUrl}/crops`;

  constructor(private http: HttpClient, private auth: AuthService) {}

  // You can remove headers if you trust the interceptor; keeping them is harmless
  private get headers() {
    const token = this.auth.token;
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  }

  addCrop(data: FormData): Observable<any> {
    return this.http.post(`${this.baseUrl}/add`, data, this.headers);
  }

  myCrops(page = 0, size = 10, sort = 'id,desc'): Observable<any> {
    const params = new HttpParams().set('page', page).set('size', size).set('sort', sort);
    return this.http.get(`${this.baseUrl}/my`, { ...this.headers, params });
  }

  update(crop: Crop): Observable<Crop> {
    return this.http.put<Crop>(`${this.baseUrl}/${crop.id}`, crop, this.headers);
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, this.headers);
  }

  getCropById(id: number): Observable<Crop> {
    return this.http.get<Crop>(`${this.baseUrl}/${id}`, this.headers);
  }
}
