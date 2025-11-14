import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService, Role } from '../service/auth.service';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const requiredRoles = (route.data['roles'] || []) as Role[];

    // 🚫 Not logged in → redirect to login
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login']);
      return false;
    }

    // ✅ No role restriction → allow
    if (!requiredRoles.length) return true;

    // ✅ User has one of the allowed roles
    if (this.auth.hasRole(requiredRoles)) return true;

    // ❌ Wrong role → redirect to their own dashboard
    const userRole = (this.auth.user?.role || '').toUpperCase();
    switch (userRole) {
      case 'FARMER':
        this.router.navigate(['/farmer']);
        break;
      case 'DEALER':
        this.router.navigate(['/dealer/crops']);
        break;
      case 'ADMIN':
        this.router.navigate(['/admin']);
        break;
      default:
        this.router.navigate(['/login']);
    }

    return false;
  }
}
