import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../service/auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user: any = null;
  editMode = false;
  roles = ['FARMER', 'DEALER', 'ADMIN'];
  updatedUser: any = {};
  loading = false;
  message = '';

  constructor(
    private auth: AuthService,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    const raw = localStorage.getItem('user');
    this.user = raw ? JSON.parse(raw) : null;
    if (!this.user) this.router.navigate(['/login']);
  }

  enableEdit() {
    this.editMode = true;
    this.updatedUser = { ...this.user };
  }

  cancelEdit() {
    this.editMode = false;
    this.message = '';
  }

  saveProfile() {
    if (!this.updatedUser?.email) return;
    this.loading = true;
    this.message = '';

    // 🔹 Choose endpoint based on provider
    const url = this.user.provider === 'GOOGLE'
      ? `${environment.apiBaseUrl}/users/role-register`
      : `${environment.apiBaseUrl}/users/update`;

    const payload =
      this.user.provider === 'GOOGLE'
        ? {
            email: this.updatedUser.email,
            name: this.updatedUser.name,
            role: this.updatedUser.role,
            sub: this.user.providerId,
          }
        : this.updatedUser;

    this.http.post(url, payload).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.message = '✅ Profile updated successfully!';
        this.user = { ...this.user, ...this.updatedUser, ...res };
        localStorage.setItem('user', JSON.stringify(this.user));
        this.editMode = false;
      },
      error: (err) => {
        this.loading = false;
        this.message = '❌ Update failed: ' + (err?.error?.message || 'Unknown error');
      }
    });
  }

  goBack() {
    this.auth.routeByRole(this.user?.role || 'FARMER');
  }
}
