import type {
  AuthResponse,
  ForgotPasswordData,
  LoginCredentials,
  RegisterData,
  ResetPasswordData,
} from '@/types/auth.types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const getToken = () => {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem('authToken');
};

async function apiRequest<TResponse>(endpoint: string, options: RequestInit = {}): Promise<TResponse> {
  const token = getToken();

  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  };

  const response = await fetch(`${API_URL}${endpoint}`, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Erro na requisição');
  }

  return data;
}

export const login = (credentials: LoginCredentials) =>
  apiRequest<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });

export const register = (payload: RegisterData) =>
  apiRequest<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const logout = () =>
  apiRequest<void>('/auth/logout', {
    method: 'POST',
  });

export const verifyToken = () =>
  apiRequest<AuthResponse>('/auth/verify', {
    method: 'GET',
  });

export const forgotPassword = (payload: ForgotPasswordData) =>
  apiRequest<AuthResponse>('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const resetPassword = (payload: ResetPasswordData) =>
  apiRequest<AuthResponse>('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const verifyEmail = (token: string) =>
  apiRequest<AuthResponse>(`/auth/verify-email/${token}`, {
    method: 'GET',
  });

export const resendVerificationEmail = (email: string) =>
  apiRequest<AuthResponse>('/auth/resend-verification', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
