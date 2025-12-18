// Frontend/src/auth/api.ts
import { apiFetch } from '../lib/api';

// These paths assume your Express app mounts auth routes like:
//   app.use('/api/auth', auth);
// and inside auth router you have:
//   router.post('/login'), router.post('/signup'), router.get('/me'), router.post('/logout')

export function apiLogin(email: string, password: string) {
  return apiFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function apiSignup(payload: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  name?: string;
  userType?: 'individual' | 'entity';
  phone: string;
  idNumber?: string;
}) {
  return apiFetch('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function apiMe() {
  return apiFetch('/api/auth/me', { method: 'GET' });
}

export function apiLogout() {
  return apiFetch('/api/auth/logout', { method: 'POST' });
}
