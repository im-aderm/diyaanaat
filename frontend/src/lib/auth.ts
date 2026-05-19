import { api } from './api';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'SUPER_ADMIN' | 'CENTER_ADMIN';
  isActive: boolean;
  userCenters: Array<{
    id: string;
    centerId: string;
    center: {
      id: string;
      name: string;
      code: string;
    };
  }>;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>('/auth/login', { email, password });
  api.setToken(response.accessToken);
  localStorage.setItem('refreshToken', response.refreshToken);
  return response;
}

export async function logout() {
  api.setToken(null);
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
}

export async function getProfile(): Promise<User> {
  return api.get<User>('/auth/profile');
}

export function getStoredUser(): User | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem('user');
  return stored ? JSON.parse(stored) : null;
}

export function storeUser(user: User) {
  localStorage.setItem('user', JSON.stringify(user));
}

export function isAuthenticated(): boolean {
  return !!api.getToken();
}
