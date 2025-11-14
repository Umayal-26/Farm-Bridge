import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AuthService } from '../../service/auth.service';
import { RequestService, RequestStatus } from '../../service/request.service';
import { CropService } from '../../service/crop.service';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';

type CropVm = {
  id?: number;
  name: string;
  type: string;
  pricePerUnit: number;
  quantity: number;
  location?: string;
  imageUrl?: string;
  farmerId?: number;
};

@Component({
  selector: 'app-farmer-dashboard',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule, HttpClientModule],
  templateUrl: './farmer-dashboard.component.html',
  styleUrls: ['./farmer-dashboard.component.css']
})
export class FarmerDashboardComponent implements OnInit {
  crops: CropVm[] = [];
  grouped: Record<string, CropVm[]> = { Vegetables: [], Fruits: [], Grains: [], Others: [] };

  requests: any[] = [];
  selectedCrop: CropVm | null = null;
  showOffers = false;

  message = '';
  loading = false;

  newCrop: CropVm = { name: '', type: '', pricePerUnit: 0, quantity: 0, location: '', imageUrl: '' };
  selectedFile: File | null = null;
  selectedFileName: string = ''; // <-- added to display filename in template

  readonly sectionsOrder = ['Vegetables', 'Fruits', 'Grains', 'Others'];

  private busyIds = new Set<number>();

  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private cropService: CropService,
    private requestService: RequestService
  ) {}

  ngOnInit() {
    this.loadMyCrops();
  }

  private normalizeType(raw?: string): string {
    const t = (raw || '').trim().toLowerCase();
    if (['veg', 'vegetable', 'vegetables'].includes(t)) return 'Vegetables';
    if (['fruit', 'fruits'].includes(t)) return 'Fruits';
    if (['grain', 'grains', 'cereal', 'cereals', 'pulses', 'pulse', 'millet', 'millets'].includes(t)) return 'Grains';
    return 'Others';
  }

  private regroup() {
    const empty: Record<string, CropVm[]> = { Vegetables: [], Fruits: [], Grains: [], Others: [] };
    for (const c of this.crops) {
      empty[this.normalizeType(c.type)].push(c);
    }
    this.grouped = empty;
  }

  loadMyCrops() {
    this.loading = true;
    this.cropService.myCrops().subscribe({
      next: (res: any) => {
        this.crops = res?.content ?? res ?? [];
        this.regroup();
        this.loading = false;
      },
      error: () => {
        this.message = '❌ Failed to load crops.';
        this.loading = false;
      }
    });
  }

  // updated: also capture filename for UI
  onFileChange(e: Event) {
    const input = e.target as HTMLInputElement;
    const f = input.files?.[0] ?? null;
    this.selectedFile = f;
    this.selectedFileName = f ? f.name : '';
  }

  resolveImage(url?: string): string {
    if (!url) return 'assets/placeholder.jpg';
    if (/^https?:\/\//i.test(url)) return url;
    const gatewayBase = environment.apiBaseUrl.replace(/\/api\/?$/, '');
    return url.startsWith('/') ? gatewayBase + url : url;
  }

  addCrop() {
    if (!this.newCrop.name?.trim() || !this.newCrop.type?.trim()) {
      this.message = '⚠️ Please fill all required crop details.';
      return;
    }

    const formData = new FormData();
    formData.append('name', this.newCrop.name.trim());
    formData.append('type', this.newCrop.type.trim());
    formData.append('pricePerUnit', String(this.newCrop.pricePerUnit || 0));
    formData.append('quantity', String(this.newCrop.quantity || 0));
    formData.append('location', this.newCrop.location?.trim() || '');

    if (this.newCrop.imageUrl?.trim()) formData.append('imageUrl', this.newCrop.imageUrl.trim());
    if (this.selectedFile) formData.append('image', this.selectedFile);

    this.loading = true;
    this.cropService.addCrop(formData).subscribe({
      next: () => {
        this.message = '✅ Crop added successfully!';
        this.newCrop = { name: '', type: '', pricePerUnit: 0, quantity: 0, location: '', imageUrl: '' };
        this.selectedFile = null;
        this.selectedFileName = ''; // clear visible filename
        this.loadMyCrops();
      },
      error: (e) => {
        this.loading = false;
        this.message = e?.error?.message || '❌ Failed to add crop.';
      }
    });
  }

  deleteCrop(id: number) {
    if (!confirm('Delete this crop permanently?')) return;
    this.loading = true;
    this.cropService.remove(id).subscribe({
      next: () => {
        this.message = '🗑️ Crop deleted.';
        this.loadMyCrops();
      },
      error: (e) => {
        this.loading = false;
        this.message = e?.error?.message || '❌ Failed to delete crop.';
      }
    });
  }

  // -----------------------------
  // VIEW OFFERS (FIXED)
  // -----------------------------
  viewOffers(crop: CropVm) {
    this.selectedCrop = crop;
    this.showOffers = true;

    const farmerId = this.auth.userId;
    if (!farmerId) {
      this.message = '❌ Cannot fetch offers: missing user id (not logged in).';
      this.requests = [];
      return;
    }

    // Use endpoint that returns farmer-specific requests (includes offeredPrice)
    this.requestService.getRequestsForFarmer(farmerId).subscribe({
      next: (res: any[]) => {
        const list = Array.isArray(res) ? res : [];
        this.requests = list.filter(r => r.cropId === crop.id);
      },
      error: () => {
        this.message = '❌ Failed to load offers.';
        this.requests = [];
      }
    });
  }

  closeModal() {
    this.showOffers = false;
    this.selectedCrop = null;
    this.requests = [];
  }

  isBusy(id: number | undefined): boolean {
    if (!id) return false;
    return this.busyIds.has(id);
  }

  acceptOffer(r: any) {
    if (!r?.id) return;
    if (this.busyIds.has(r.id)) return;

    this.busyIds.add(r.id);
    this.requestService.updateStatus(r.id, 'APPROVED' as RequestStatus).subscribe({
      next: () => {
        r.status = 'APPROVED';
        this.message = '✅ Offer accepted.';
        this.busyIds.delete(r.id);
      },
      error: (e) => {
        this.message = e?.error?.message || '❌ Failed to accept offer.';
        this.busyIds.delete(r.id);
      }
    });
  }

  rejectOffer(r: any) {
    if (!r?.id) return;
    if (!confirm('Reject this offer?')) return;
    if (this.busyIds.has(r.id)) return;

    this.busyIds.add(r.id);
    this.requestService.updateStatus(r.id, 'REJECTED' as RequestStatus).subscribe({
      next: () => {
        r.status = 'REJECTED';
        this.message = '🛑 Offer rejected.';
        this.busyIds.delete(r.id);
      },
      error: (e) => {
        this.message = e?.error?.message || '❌ Failed to reject offer.';
        this.busyIds.delete(r.id);
      }
    });
  }

  onImageError(event: Event) {
    const element = event.target as HTMLImageElement;
    if (element && element.src !== 'assets/placeholder.jpg') {
      element.src = 'assets/placeholder.jpg';
    }
  }

  logout() {
    this.auth.logout();
  }
}
