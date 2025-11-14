import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RequestService } from '../../service/request.service';
import { PaymentService } from '../../service/payment.service';
import { NotificationService } from '../../service/notification.service';
import { AuthService } from '../../service/auth.service';
import { HttpClientModule } from '@angular/common/http';
import { interval, Subscription, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { RequestStateService } from '../../service/request-state.service.service';

type AnyReq = any;

@Component({
  selector: 'app-dealer-requests',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './dealer-requests.component.html',
  styleUrls: ['./dealer-requests.component.css']
})
export class DealerRequestsComponent implements OnInit, OnDestroy {
  myRequests: AnyReq[] = [];
  acceptedOffers: AnyReq[] = [];
  payments: any[] = [];
  notifications: any[] = [];
  message = '';
  loading = false;

  // Cart
  cart: AnyReq[] = [];
  cartBusy = false;

  // Toast (popup) state
  toast = {
    visible: false,
    message: '',
    type: 'success' as 'success' | 'error' | 'info',
    autoHideMs: 3500,
    timerSub: null as Subscription | null
  };

  private pollSub: Subscription | null = null;
  private notifySub: Subscription | null = null;

  constructor(
    private reqService: RequestService,
    private paymentService: PaymentService,
    private notifyService: NotificationService,
    private auth: AuthService,
    private requestState: RequestStateService
  ) {}

  ngOnInit() {
    this.loadAll();

    this.notifySub = this.requestState.onChanged().subscribe(() => {
      this.loadAll();
    });

    this.pollSub = interval(8000)
      .pipe(switchMap(() => this.reqService.myAsDealer()))
      .subscribe({
        next: (res: any[]) => {
          this.myRequests = Array.isArray(res) ? res : [];
          this.acceptedOffers = this.myRequests.filter(r => this.isAccepted(r.status));
        },
        error: () => {}
      });
  }

  ngOnDestroy() {
    this.pollSub?.unsubscribe();
    this.notifySub?.unsubscribe();
    this.toast.timerSub?.unsubscribe();
  }

  /* -------------------------
     Helpers & derived props
     ------------------------- */
  get requests(): AnyReq[] {
    return this.myRequests;
  }

  private isAccepted(status?: string): boolean {
    const s = (status || '').toUpperCase();
    return s === 'APPROVED' || s === 'ACCEPTED';
  }

  get filtered(): {
    pending: AnyReq[];
    accepted: AnyReq[];
    completed: AnyReq[];
    rejected: AnyReq[];
  } {
    const pending = this.myRequests.filter(r => !r.status || r.status.toUpperCase() === 'PENDING');
    const accepted = this.myRequests.filter(r => this.isAccepted(r.status));
    const completed = this.myRequests.filter(
      r => (r.status || '').toUpperCase() === 'COMPLETED' || (r.status || '').toUpperCase() === 'PAID'
    );
    const rejected = this.myRequests.filter(
      r => (r.status || '').toUpperCase() === 'REJECTED' || (r.status || '').toUpperCase() === 'CANCELLED'
    );
    return { pending, accepted, completed, rejected };
  }

  /* -------------------------
     Loaders
     ------------------------- */
  loadAll() {
    this.message = '';
    this.loading = true;

    this.reqService.myAsDealer().subscribe({
      next: (res: any[]) => {
        this.myRequests = Array.isArray(res) ? res : [];
        this.acceptedOffers = this.myRequests.filter(r => this.isAccepted(r.status));
        this.loading = false;
      },
      error: () => {
        this.message = '❌ Failed to load requests.';
        this.loading = false;
      }
    });

    this.paymentService.getPaymentsForDealer?.().subscribe?.({
      next: (p: any) => { this.payments = p ?? []; },
      error: () => {}
    });

    this.notifyService.getMyNotifications?.().subscribe?.({
      next: (n: any) => { this.notifications = n ?? []; },
      error: () => {}
    });
  }

  refresh() {
    this.loadAll();
  }

  /* -------------------------
     Cart functions
     ------------------------- */
  cartCount(): number {
    return this.cart.length;
  }

  cartTotal(): number {
    return this.cart.reduce((sum, r) => sum + ((r.offeredPrice || 0) * (r.quantity || 0)), 0);
  }

  addToCart(req: AnyReq) {
    if (!req?.id) {
      this.message = 'Invalid request (missing id).';
      return;
    }
    if (!this.isAccepted(req.status)) {
      this.message = 'Only approved offers can be added to cart.';
      return;
    }
    if (this.cart.find(c => c.id === req.id)) {
      this.message = 'This request is already in your cart.';
      return;
    }
    this.cart.push(req);
    this.message = `➕ Added Request #${req.id} to cart.`;
  }

  removeFromCart(req: AnyReq) {
    this.cart = this.cart.filter(c => c.id !== req.id);
    this.message = `🗑️ Removed Request #${req.id} from cart.`;
  }

  clearCart() {
    this.cart = [];
    this.message = 'Cart cleared.';
  }

  checkoutCart() {
    if (!this.cart.length) {
      this.message = 'Cart is empty.';
      return;
    }

    const total = this.cartTotal();
    if (!confirm(`Checkout ${this.cart.length} item(s) for ₹${total}?`)) return;

    this.cartBusy = true;
    this.message = '';

    const items = [...this.cart];

    const processNext = (index: number) => {
      if (index >= items.length) {
        this.cartBusy = false;
        this.message = '✅ Payment(s) completed.';
        this.clearCart();
        this.loadAll();
        return;
      }

      const item = items[index];
      const amount = (item.offeredPrice || 0) * (item.quantity || 0);

      if (!item.farmerId || !item.cropId) {
        console.warn(`Skipping item ${item.id} due to missing IDs.`);
        processNext(index + 1);
        return;
      }

      if (amount <= 0) {
        this.cartBusy = false;
        this.showToast(`Invalid amount for request #${item.id}.`, 'error');
        return;
      }

      // inside checkoutCart() -> processNext
this.paymentService.makePayment({
  requestId: item.id,       // <-- IMPORTANT: add requestId
  farmerId: item.farmerId,
  cropId: item.cropId,
  amount
}).subscribe({
  next: (res) => {
    // show toast for each payment success
    const msg = res?.message ?? 'Payment completed';
    this.showToast(msg, 'success');

    // notify other components / refresh requests so accepted -> completed shows up
    this.requestState?.notifyChanged?.();

    // continue to next
    processNext(index + 1);
  },
  error: (err) => {
    this.cartBusy = false;
    const txt = err?.error?.message || err?.message || `❌ Payment failed for request #${item.id}`;
    this.showToast(txt, 'error');
  }
});

    };

    processNext(0);
  }


payFarmer(req: AnyReq) {
  const unit = req?.offeredPrice ?? req?.pricePerUnit ?? 0;
  const qty = req?.quantity ?? 0;
  const amount = unit * qty;

  if (amount <= 0) {
    this.message = '❌ Cannot pay: amount is zero. Check offered price and quantity.';
    return;
  }
  if (!confirm(`Pay ₹${amount} to Farmer ${req?.farmerId || 'N/A'}?`)) return;

  // IMPORTANT: include requestId here
  this.paymentService.makePayment({
    requestId: req.id,
    farmerId: req.farmerId,
    cropId: req.cropId,
    amount
  }).subscribe({
    next: () => {
      // show success UI and refresh
      alert('✅ Payment successful');
      // notify other components to refresh (if you use RequestStateService)
      this.requestState?.notifyChanged?.();
      this.loadAll();
    },
    error: (err) => {
      this.message = err?.error?.message || err?.message || '❌ Payment failed.';
    }
  });
}


  /* -------------------------
     Status updates
     ------------------------- */
  statusLabel(s?: string) {
    return (s || '').toUpperCase();
  }

  markPaymentHandled(paymentId: number) {
    this.payments = this.payments.filter(p => p.id !== paymentId);
    this.message = 'Marked payment as handled.';
  }

  markAsCompleted(req: any) {
    const price = prompt(`Enter final agreed price per unit for ${req.cropName}:`, req.offeredPrice || '');
    if (!price || isNaN(+price) || +price <= 0) {
      alert('Invalid price.');
      return;
    }

    this.reqService.completeRequest(req.id, +price).subscribe({
      next: (res) => {
        this.showToast(`Request #${req.id} marked completed.`, 'success');
        this.loadAll();
      },
      error: (err) => {
        this.showToast(err?.error?.message || '❌ Failed to complete request.', 'error');
      }
    });
  }

  /* -------------------------
     Toast (popup) helpers
     ------------------------- */
  private clearToastTimer() {
    if (this.toast.timerSub) {
      this.toast.timerSub.unsubscribe();
      this.toast.timerSub = null;
    }
  }

  showToast(message: string, type: 'success' | 'error' | 'info' = 'success', autoHideMs?: number) {
    this.clearToastTimer();
    this.toast.message = message;
    this.toast.type = type;
    this.toast.visible = true;
    const ms = autoHideMs ?? this.toast.autoHideMs;

    // start auto-hide timer
    this.toast.timerSub = timer(ms).subscribe(() => {
      this.toast.visible = false;
      this.clearToastTimer();
    });
  }

  dismissToast() {
    this.toast.visible = false;
    this.clearToastTimer();
  }

  logout() {
    this.auth.logout();
  }
}
