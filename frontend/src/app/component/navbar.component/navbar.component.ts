import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../service/auth.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, HttpClientModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  user: any;
  dropdownOpen = false;
  cartCount = 0;

  constructor(public auth: AuthService, private router: Router) {
    this.loadUser();
    this.updateCartCount();
  }

  // Hide navbar on login/register/select-role pages
  get showNavbar(): boolean {
    const hideOn = ['/login', '/register', '/select-role'];
    return !hideOn.includes(this.router.url);
  }

  loadUser() {
    const raw = localStorage.getItem('user');
    this.user = raw ? JSON.parse(raw) : null;
  }

  updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('dealerCart') || '[]');
    this.cartCount = Array.isArray(cart) ? cart.length : 0;
  }

  logout() {
    // central logout; AuthService clears storage and routes to /login
    this.auth.logout();
  }

  goHome() {
    if (this.user?.role) {
      this.auth.routeByRole(this.user.role);
    } else {
      this.router.navigate(['/']);
    }
  }

  viewProfile() {
    this.dropdownOpen = false;
    this.router.navigate(['/profile']);
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.profile-container')) {
      this.dropdownOpen = false;
    }
  }
}
