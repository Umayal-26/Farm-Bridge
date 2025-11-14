import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { RouterModule } from '@angular/router';

type CropRow = {
  id: number;
  name: string;
  type: string;
  quantity: number;
  pricePerUnit: number;
  farmerId: number;
  createdAt?: string;
  imageUrl?: string;
  location?: string;
};

@Component({
  selector: 'app-admin-crops',
  standalone: true,
  imports: [CommonModule, HttpClientModule, RouterModule],
  templateUrl: './admin-crops.component.html',
  styleUrls: ['./admin-crops.component.css']
})
export class AdminCropsComponent implements OnInit {
  private base = `${environment.apiBaseUrl}/crops/admin`;
  rows: CropRow[] = [];
  loading = true;
  message = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.message = '';
    this.http.get<CropRow[]>(`${this.base}/pending`).subscribe({
      next: (data) => { this.rows = data || []; this.loading = false; },
      error: (err) => {
        this.loading = false;
        this.message = err?.error?.message || 'Failed to load pending crops.';
      }
    });
  }

  approve(id: number): void { this.action(id, 'approve', 'Approved'); }
  reject(id: number): void { this.action(id, 'reject', 'Rejected'); }

  private action(id: number, op: 'approve'|'reject', label: string): void {
    this.message = '';
    this.http.put(`${this.base}/${id}/${op}`, {}).subscribe({
      next: () => {
        this.rows = this.rows.filter(r => r.id !== id);
        this.message = `✅ ${label} crop #${id}.`;
      },
      error: (err) => this.message = err?.error?.message || `Failed to ${op} crop.`
    });
  }

  /** Force images to load via gateway, not Angular (4200) */
  resolveImage(url?: string): string {
    if (!url) return 'assets/crop-placeholder.jpg';
    if (/^https?:\/\//i.test(url)) return url;
    const gateway = environment.apiBaseUrl.replace(/\/api\/?$/, '');
    return url.startsWith('/') ? `${gateway}${url}` : `${gateway}/${url}`;
  }

  /** 👈 Add this to satisfy trackBy in the template */
  trackById(index: number, item: CropRow): number {
    return item.id;
  }
}
