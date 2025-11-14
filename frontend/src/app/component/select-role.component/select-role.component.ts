import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, Role } from '../../service/auth.service';

@Component({
  selector: 'app-select-role',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './select-role.component.html',
  styleUrls: ['./select-role.component.css'],
})
export class SelectRoleComponent {
  selectedRole: Role | null = null;
  userData: any;
  loading = false;
  error = '';

  constructor(private auth: AuthService, private router: Router) {
    // Retrieve the pending Google user info from localStorage
    const pending = localStorage.getItem('pendingGoogleUser');
    if (pending) {
      this.userData = JSON.parse(pending);
    } else {
      // No pending data → go back to login
      this.router.navigate(['/login']);
    }
  }

  // Select role from UI
  chooseRole(role: Role): void {
    this.selectedRole = role;
  }

  // Confirm role and register in backend
  confirmRole(): void {
    if (!this.selectedRole || !this.userData) return;

    this.loading = true;
    this.error = '';

    const payload = {
      email: this.userData.email,
      name: this.userData.name,
      role: this.selectedRole,
      sub: this.userData.sub,
    };

    this.auth.registerGoogleRole(payload).subscribe({
      next: (res) => {
        localStorage.removeItem('pendingGoogleUser');
        this.loading = false;
        this.auth.routeByRole(res.role);
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.error || 'Failed to register role.';
      },
    });
  }

  cancel(): void {
    localStorage.removeItem('pendingGoogleUser');
    this.router.navigate(['/login']);
  }
}
