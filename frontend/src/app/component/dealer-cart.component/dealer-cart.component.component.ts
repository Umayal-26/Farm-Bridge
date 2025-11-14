import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RequestService } from '../../service/request.service';
import { Router, RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

type CartItem = {
  id: number;
  crop: any;
  quantity: number;
  offeredPrice: number;
};

@Component({
  selector: 'app-dealer-cart',
  standalone: true,
  imports: [CommonModule, RouterModule, HttpClientModule],
  templateUrl: './dealer-cart.component.component.html',
  styleUrls: ['./dealer-cart.component.component.css']
})
export class DealerCartComponent implements OnInit {
  cart: CartItem[] = [];
  busy = false;
  message = '';

  // fallback placeholder filename inside src/assets
  private readonly placeholderPath = '/assets/placeholder.jpg';

  constructor(private requestService: RequestService, private router: Router) {}

  ngOnInit() {
    this.loadCart();
  }

  loadCart() {
    this.cart = JSON.parse(localStorage.getItem('dealerCart') || '[]') as CartItem[];
  }

  saveCart() {
    localStorage.setItem('dealerCart', JSON.stringify(this.cart));
  }

  updateQty(item: CartItem, delta: number) {
    item.quantity = Math.max(1, (item.quantity || 1) + delta);
    this.saveCart();
  }

  setQty(item: CartItem, v: string) {
    const n = Number(v);
    item.quantity = Number.isFinite(n) && n > 0 ? Math.floor(n) : 1;
    this.saveCart();
  }

  setPrice(item: CartItem, v: string) {
    const n = Number(v);
    item.offeredPrice = Number.isFinite(n) && n >= 0 ? n : 0;
    this.saveCart();
  }

  removeFromCart(id: number) {
    this.cart = this.cart.filter(c => c.id !== id);
    this.saveCart();
    this.message = `Removed item #${id} from cart.`;
  }

  clearCart() {
    if (!confirm('Clear cart?')) return;
    this.cart = [];
    localStorage.removeItem('dealerCart');
    this.message = 'Cart cleared.';
  }

  requestOne(item: CartItem) {
    if (this.busy) return;
    if (!item || !item.id) return;

    if (!confirm(`Send request for ${item.crop?.name || 'crop'} — qty ${item.quantity} @ ₹${item.offeredPrice}?`)) return;

    this.busy = true;
    this.requestService.createRequest(item.id, item.offeredPrice, item.quantity).subscribe({
      next: () => {
        this.busy = false;
        this.removeFromCart(item.id);
        alert('✅ Crop request sent!');
      },
      error: (err) => {
        this.busy = false;
        console.error(err);
        alert('❌ Failed to send request: ' + (err?.error?.message || err?.message || 'Unknown'));
      }
    });
  }

  requestAll() {
    if (!this.cart.length) {
      alert('Cart is empty.');
      return;
    }
    if (!confirm(`Send requests for ${this.cart.length} item(s)?`)) return;

    this.busy = true;
    const items = [...this.cart];

    const process = (index: number) => {
      if (index >= items.length) {
        this.busy = false;
        this.message = 'All requests sent.';
        this.cart = [];
        localStorage.removeItem('dealerCart');
        return;
      }
      const it = items[index];
      this.requestService.createRequest(it.id, it.offeredPrice, it.quantity).subscribe({
        next: () => process(index + 1),
        error: (err) => {
          this.busy = false;
          console.error('Failed on item', it, err);
          alert('❌ Stopped: failed to send request for ' + (it.crop?.name || it.id));
        }
      });
    };

    process(0);
  }

  goToRequests() {
    this.router.navigate(['/dealer/requests']);
  }

  getCartTotal(): number {
    return this.cart.reduce((sum, item) => {
      const qty = item.quantity || 0;
      const price = item.offeredPrice || 0;
      return sum + qty * price;
    }, 0);
  }

  // ---------- Image helpers ----------

  /**
   * Resolve a crop image URL to an absolute URL that the browser can fetch.
   * - If backend returns a full URL (http/https) we use it.
   * - If backend returns a server-relative path (starts with '/'), we prepend the gateway/host origin.
   * - Otherwise fallback to /assets/placeholder.jpg
   */
  resolveImage(url?: string): string {
  if (!url) return 'http://localhost:8080/uploads/default.jpg'; // optional backend default
  if (url.startsWith('http')) return url;
  return `http://localhost:8080${url}`;
}


  getPlaceholderUrl() {
    // ensure an absolute path to avoid single-page-app routing interfering
    return `${window.location.protocol}//${window.location.host}${this.placeholderPath}`;
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    if (!img) return;
    img.onerror = null; // prevent infinite loop
    img.src = this.getPlaceholderUrl();
  }
}
