import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { AuthService, Role } from '../../service/auth.service';
import { OAuthComponent } from '../oauth.component/oauth.component';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, HttpClientModule, OAuthComponent, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnInit {
  clientId = environment.googleClientId;
  form!: FormGroup;
  loading = false;
  error = '';
  success = '';
  showRoleModal = false;
  gEmail = '';
  gName = '';
  gSub = '';
  selectedRole: Role = 'FARMER';

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {}

  ngOnInit() {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['FARMER', Validators.required],
    });
  }

  submit() {
  Object.keys(this.form.controls).forEach(key => {
    const control = this.form.get(key);
    if (typeof control?.value === 'string') {
      control.setValue(control.value.trim());
    }
    control?.markAsTouched();
  });

  if (this.form.invalid) {
    this.error = 'Please fill all fields correctly.';
    return;
  }

  this.loading = true;
  this.auth.register(this.form.value).subscribe({
    next: () => {
      this.loading = false;
      this.success = 'Registered successfully!';
      setTimeout(() => this.router.navigate(['/login']), 1000);
    },
    error: (e) => {
      this.loading = false;
      this.error = e?.error?.message || 'Registration failed.';
    },
  });
}


 // RegisterComponent.ts (replace existing onGoogleToken)
onGoogleToken(idToken: string) {
  this.loading = true;
  // Debug log (optional)
  console.log('DEBUG: received google idToken length =', idToken?.length);

  this.auth.googleLogin(idToken).subscribe({
    next: (r: any) => {
      this.loading = false;
      console.log('DEBUG: /users/google-login response:', r);

      // Case A: server returned a token -> existing user, proceed to dashboard
      if (r?.token) {
        // ensure it's saved (AuthService.googleLogin already pipes saveUser, but double-safe)
        this.auth.saveUser(r);
        this.auth.routeByRole(r.role ?? r?.user?.role);
        return;
      }

      // Case B: server returned 202 -> new verified Google user: open role modal
      // Note: backend returns { status: 202, email, name, sub }
      if (r?.status === 202 || r?.status === '202') {
        this.gEmail = r.email || '';
        this.gName = r.name || r.email || '';
        this.gSub = r.sub || r?.providerId || '';
        this.showRoleModal = true;
        return;
      }

      // Unexpected success response
      this.error = 'Unexpected response from server during Google sign-in.';
      console.warn('Unexpected google-login response:', r);
    },
    error: (e) => {
      this.loading = false;
      console.error('Google login HTTP error', e);

      // Some servers may respond with 202 via error; keep the fallback
      if (e?.status === 202 && e?.error) {
        const body = e.error;
        this.gEmail = body.email || '';
        this.gName = body.name || this.gEmail;
        this.gSub = body.sub || '';
        this.showRoleModal = true;
        return;
      }

      this.error = e?.error?.message || 'Google login failed.';
    }
  });
}


  confirmGoogleRole() {
    this.loading = true;
    this.auth
      .registerGoogleRole({
        email: this.gEmail,
        name: this.gName,
        role: this.selectedRole,
        sub: this.gSub,
      })
      .subscribe({
        next: (r) => {
          this.loading = false;
          this.showRoleModal = false;
          this.auth.routeByRole(r?.role);
        },
        error: (e) => {
          this.loading = false;
          this.error = e?.error?.message || 'Role save failed.';
        },
      });
  }

  cancelRoleModal() {
    this.showRoleModal = false;
  }
}
