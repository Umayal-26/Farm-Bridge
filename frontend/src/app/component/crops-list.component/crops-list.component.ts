import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../service/auth.service';

export type Crop = {
  id?: number;
  farmerId?: number;
  type?: string;
  name?: string;
  quantity?: number;
  location?: string;
  imageUrl?: string;
  pricePerUnit?: number;
  status?: 'PENDING'|'APPROVED'|'REJECTED';
  createdAt?: string;
  updatedAt?: string;
};

@Component({
  selector: 'app-crops-list',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, RouterModule],
  templateUrl: './crops-list.component.html',
  styleUrls: ['./crops-list.component.css']
})
export class CropsListComponent implements OnInit {
  crops: Crop[] = [];
  loading = false;
  message = '';
  query = '';

  page = 0;
  size = 9;
  totalPages = 0;
  private baseUrl = `${environment.apiBaseUrl}/crops`;

  constructor(
    private http: HttpClient,
    private router: Router,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.loadCrops();
  }

  resolveImage(url?: string): string {
    if (!url) return 'assets/placeholder.jpg';
    if (/^https?:\/\//i.test(url)) return url;
    const gateway = environment.apiBaseUrl.replace(/\/api\/?$/, '');
    return url.startsWith('/') ? `${gateway}${url}` : `${gateway}/${url}`;
  }

  search(): void {
    this.page = 0;
    this.loadCrops();
  }

  loadCrops(): void {
    this.loading = true;
    this.message = '';

    const params: any = {
      q: this.query ?? '',
      page: this.page,
      size: this.size,
      sort: 'createdAt,desc'
    };

    this.http.get<any>(`${this.baseUrl}/search`, { params }).subscribe({
      next: (res) => {
        const content = res?.content ?? res ?? [];
        this.crops = content;
        this.totalPages = res?.totalPages ?? 1;
        if (!this.crops.length) this.message = 'No crops found for this search.';
        this.loading = false;
      },
      error: (err) => {
        if (err?.status === 400) {
          this.http.get<any>(`${this.baseUrl}`, {
            params: { page: this.page, size: this.size, sort: 'createdAt,desc' }
          }).subscribe({
            next: (res2) => {
              const content = res2?.content ?? res2 ?? [];
              this.crops = content;
              this.totalPages = res2?.totalPages ?? 1;
              if (!this.crops.length) this.message = 'No crops available.';
              this.loading = false;
            },
            error: (e2) => {
              this.loading = false;
              this.message = e2?.error?.message || 'Failed to fetch crops.';
            }
          });
        } else {
          this.loading = false;
          this.message = err?.error?.message || 'Failed to fetch crops.';
        }
      }
    });
  }

  changePage(newPage: number): void {
    if (newPage < 0 || newPage >= this.totalPages) return;
    this.page = newPage;
    this.loadCrops();
  }

    /** Instead of sending request directly → add to cart */
  addToCart(crop: Crop): void {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    // cart item shape: { id: crop.id, crop, quantity, offeredPrice }
    const existingCart = JSON.parse(localStorage.getItem('dealerCart') || '[]') as any[];

    if (existingCart.some(c => c.id === crop.id)) {
      alert('🌾 Crop already added to cart.');
      return;
    }

    const item = {
      id: crop.id,
      crop,
      // sensible defaults so user can adjust in cart
      quantity: 1,
      offeredPrice: crop.pricePerUnit || 0
    };

    existingCart.push(item);
    localStorage.setItem('dealerCart', JSON.stringify(existingCart));
    alert(`🛒 ${crop.name} added to cart successfully!`);
  }

}
