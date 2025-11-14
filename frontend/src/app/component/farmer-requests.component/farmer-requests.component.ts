import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RequestService } from '../../service/request.service';
import { PaymentService } from '../../service/payment.service';
import { NotificationService } from '../../service/notification.service';
import { AuthService } from '../../service/auth.service';

@Component({
  selector: 'app-farmer-requests',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './farmer-requests.component.html',
  styleUrls: ['./farmer-requests.component.css']
})
export class FarmerRequestsComponent implements OnInit {
  myRequests: any[] = [];
  payments: any[] = [];
  notifications: any[] = [];
  message = '';
  loading = false;

  constructor(
    private reqService: RequestService,
    private paymentService: PaymentService,
    private notifyService: NotificationService,
    private auth: AuthService
  ) {}

  ngOnInit() {
    this.loadRequests();
    this.loadPayments();
    this.loadNotifications();
  }

  loadRequests() {
    this.reqService.getMyRequests().subscribe({
      next: (res) => (this.myRequests = res),
      error: () => (this.message = '❌ Failed to load requests.')
    });
  }

  loadPayments() {
    this.paymentService.getPaymentsForFarmer().subscribe({
      next: (res) => (this.payments = res),
      error: () => (this.message = '❌ Failed to load payments.')
    });
  }

  loadNotifications() {
    this.notifyService.getMyNotifications().subscribe({
      next: (res) => (this.notifications = res),
      error: () => (this.message = '❌ Failed to load notifications.')
    });
  }

  logout() {
    this.auth.logout();
  }
}
