import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AuthService, Role } from '../../service/auth.service';
import { OAuthComponent } from '../oauth.component/oauth.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, OAuthComponent, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements AfterViewInit {
  email = '';
  password = '';
  loading = false;
  error = '';
  clientId = environment.googleClientId;

  // Role-selection modal state
  showRoleModal = false;
  gPendingEmail = '';
  gPendingName = '';
  gPendingSub = '';

  selectedRole: Role = 'FARMER';

  /** Added for Google OAuth fallback */
  oauthAvailable = true;

  /** Use ViewChild to reliably detect the child component instance */
  @ViewChild(OAuthComponent, { static: false }) oauthComp?: OAuthComponent;

  constructor(private auth: AuthService, private router: Router) {}

  submit() {
    if (!this.email || !this.password) {
      this.error = 'Please enter both email and password.';
      return;
    }
    this.loading = true;
    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: (res) => {
        this.loading = false;
        this.auth.saveUser(res);   // save first
        this.auth.routeByRole(res?.role);  // then route
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || 'Invalid credentials.';
      },
    });
  }

  // update onGoogleToken to handle 202 properly (debug-friendly)
  onGoogleToken(idToken: string) {
    console.log('DEBUG: idToken len', idToken?.length);
    this.loading = true;

    this.auth.googleLogin(idToken).subscribe({
      next: (r: any) => {
        this.loading = false;
        console.log('DEBUG: /users/google-login response:', r);

        // Successful login with token -> save and route
        if (r?.token) {
          this.auth.saveUser(r);
          this.auth.routeByRole(r.role);
          return;
        }

        // 202: need role selection
        if (r?.status === 202) {
          this.gPendingEmail = r.email;
          this.gPendingName = r.name;
          this.gPendingSub = r.sub;
          this.showRoleModal = true;     // show the role-pick UI
          return;
        }

        // unexpected
        this.error = 'Google login succeeded but server returned unexpected response.';
      },
      error: (e) => {
        this.loading = false;
        console.error('Google login HTTP error', e);
        this.error = e?.error?.message || 'Google login failed.';
      },
    });
  }

  // Called when user confirms role from the modal
  confirmGoogleRole(role: 'FARMER' | 'DEALER') {
    if (!this.gPendingEmail || !this.gPendingSub) {
      this.error = 'Missing Google details.';
      return;
    }
    this.loading = true;
    const payload = {
      email: this.gPendingEmail,
      name: this.gPendingName,
      role: role,
      sub: this.gPendingSub  // backend expects "sub"
    };
    this.auth.registerGoogleRole(payload).subscribe({
      next: (resp: any) => {
        this.loading = false;
        // auth.registerGoogleRole pipes saveUser, but ensure saved:
        this.auth.saveUser(resp);
        this.showRoleModal = false;
        this.auth.routeByRole(resp.role);
      },
      error: (err) => {
        this.loading = false;
        console.error('Role registration failed', err);
        this.error = err?.error?.message || 'Role registration failed.';
      }
    });
  }

  /** ✅ Safer detection using ViewChild */
  ngAfterViewInit() {
    // tiny delay to let child initialize
    setTimeout(() => {
      if (!this.oauthComp) {
        this.oauthAvailable = false;
        console.warn('OAuth component instance not found — showing fallback Google button');
      } else {
        this.oauthAvailable = true;
        console.log('OAuth component detected via @ViewChild — using embedded OAuth UI.');
      }
    }, 180);
  }

  /** fallback that redirects to backend OAuth endpoint */
  startLegacyGoogleAuth() {
    window.location.href = '/api/auth/google';
  }
}
