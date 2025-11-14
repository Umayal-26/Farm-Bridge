export interface User {
  id?: number;
  name?: string;
  email: string;
  password?: string;
  role?: 'FARMER' | 'DEALER' | 'ADMIN';
  provider?: string | null;
  providerId?: string | null;
  enabled?: boolean;
}
