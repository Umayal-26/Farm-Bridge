import { HttpInterceptorFn } from '@angular/common/http';

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  const userData = localStorage.getItem('user');
  let token: string | null = null;
  let userId: string | null = null;
  let role: string | null = null;

  if (userData) {
    try {
      const parsed = JSON.parse(userData);
      token = parsed.token || null;
      userId = parsed.userId?.toString() || null;
      role = parsed.role || null;
    } catch (e) {
      console.error('❌ Error parsing user data from localStorage:', e);
    }
  }

  const isAuthEndpoint =
    req.url.includes('/users/login') ||
    req.url.includes('/users/register') ||
    req.url.includes('/users/google-login') ||
    req.url.includes('/users/role-register');

  if (token && !isAuthEndpoint) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
        ...(userId ? { 'X-User-Id': userId } : {}),
        ...(role ? { 'X-User-Role': role } : {}),
      },
    });
    return next(cloned);
  }

  return next(req);
};
