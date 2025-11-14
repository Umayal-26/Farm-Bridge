import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../service/auth.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, HttpClientModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  crops: any[] = [];
  message = '';
  loading = false;

  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) {}

  ngOnInit() {
    this.loadCrops();
  }

  loadCrops() {
    this.loading = true;
    this.message = '';
    this.http.get<any[]>(`${environment.apiBaseUrl}/crops/all`).subscribe({
      next: (res) => {
        this.crops = Array.isArray(res) ? res : [];
        this.loading = false;
        if (!this.crops.length) this.message = 'No crops found.';
      },
      error: (err) => {
        this.message = err?.error?.message || '❌ Failed to load crops.';
        this.loading = false;
      }
    });
  }

  deleteCrop(id: number) {
    if (!confirm('Are you sure you want to delete this crop?')) return;
    this.http.delete(`${environment.apiBaseUrl}/crops/${id}`).subscribe({
      next: () => {
        this.message = '🗑️ Crop deleted.';
        this.loadCrops();
      },
      error: () => {
        this.message = '❌ Failed to delete crop.';
      }
    });
  }

  logout() {
    this.auth.logout();
  }
}
