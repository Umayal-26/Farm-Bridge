import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { Observable, tap } from 'rxjs';

export type Role = 'FARMER' | 'DEALER' | 'ADMIN';

interface LoginRes {
  token?: string;
  role?: Role | string;
  userId?: number | string;
  email?: string;
  name?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private base = environment.apiBaseUrl;

  constructor(private http: HttpClient, private router: Router) {}

  get user(): any {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  }

  get token(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.token;
  }

  get userId(): number | null {
    const id = this.user?.userId ?? this.user?.id;
    return id != null ? Number(id) : null;
  }

  hasRole(roles: Role[]): boolean {
    const roleStr = (this.user?.role || '').toString().toUpperCase();
    if (!roleStr) return false;
    return roles.map(r => r.toUpperCase()).includes(roleStr as Role);
  }

  register(data: any): Observable<any> {
    return this.http.post(`${this.base}/users/register`, data, {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  login(data: { email: string; password: string }): Observable<LoginRes> {
    return this.http.post<LoginRes>(`${this.base}/users/login`, data, {
      headers: { 'Content-Type': 'application/json' },
    }).pipe(tap(res => this.saveUser(res))); // ✅ call saveUser now
  }

  googleLogin(idToken: string): Observable<LoginRes> {
    return this.http.post<LoginRes>(
      `${this.base}/users/google-login`,
      { idToken },
      { headers: { 'Content-Type': 'application/json' } }
    ).pipe(tap(res => this.saveUser(res))); // ✅ call saveUser now
  }

  registerGoogleRole(data: any): Observable<LoginRes> {
    return this.http.post<LoginRes>(
      `${this.base}/users/role-register`,
      data,
      { headers: { 'Content-Type': 'application/json' } }
    ).pipe(tap(res => this.saveUser(res)));
  }

  /** ✅ Make this public so components can call it */
  saveUser(res: LoginRes) {
    if (res.token) localStorage.setItem('token', res.token);
    localStorage.setItem('user', JSON.stringify(res));
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  /** ✅ Redirect based on role (robust normalization) */
routeByRole(role?: Role | string | null) {
  // prefer explicit arg, then saved user role
  const raw = (role ?? this.user?.role ?? '').toString();
  const r = raw.trim().toUpperCase().replace(/^ROLE_/, ''); // remove ROLE_ prefix, trim, upper

  console.log('routeByRole: normalized role ->', { raw, normalized: r });

  switch (r) {
    case 'FARMER':
      this.router.navigateByUrl('/farmer/crops');
      break;
    case 'DEALER':
      this.router.navigateByUrl('/dealer/crops');
      break;
    case 'ADMIN':
      this.router.navigateByUrl('/admin');
      break;
    default:
      // if role is unknown, route to a safe default (login)
      console.warn('Unknown role, routing to /login', { role: raw });
      this.router.navigateByUrl('/login');
  }
}

}
