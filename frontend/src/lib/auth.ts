import { api } from './api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

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
  const refreshToken = localStorage.getItem('refreshToken');
  if (refreshToken) {
    fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    }).catch(() => {});
  }
  api.setToken(null);
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
}

export async function getProfile(): Promise<User> {
  return api.get<User>('/auth/profile');
}

export function storeUser(user: User) {
  localStorage.setItem('user', JSON.stringify(user));
}

export function isAuthenticated(): boolean {
  return !!api.getToken();
}
