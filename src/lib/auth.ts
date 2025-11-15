import type {
  AuthResponse,
  ForgotPasswordData,
  LoginCredentials,
  RegisterData,
  ResetPasswordData,
} from '@/types/auth.types';
import * as api from '@/lib/api';

const persistTokens = (response: AuthResponse, rememberMe?: boolean) => {
  if (typeof window === 'undefined') return;
  if (response.token) {
    window.localStorage.setItem('authToken', response.token);
  }
  if (response.refreshToken) {
    window.localStorage.setItem('refreshToken', response.refreshToken);
  }
  if (rememberMe) {
    window.localStorage.setItem('rememberMe', 'true');
  } else {
    window.localStorage.removeItem('rememberMe');
  }
};

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await api.login(credentials);
  if (response.success) {
    persistTokens(response, credentials.rememberMe);
  }
  return response;
};

export const register = async (payload: RegisterData): Promise<AuthResponse> => {
  const response = await api.register(payload);
  if (response.success) {
    persistTokens(response);
  }
  return response;
};

export const logout = async (): Promise<void> => {
  try {
    await api.logout();
  } finally {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('authToken');
      window.localStorage.removeItem('refreshToken');
      window.localStorage.removeItem('rememberMe');
    }
  }
};

export const verifySession = () => api.verifyToken();

export const forgotPassword = (payload: ForgotPasswordData) => api.forgotPassword(payload);

export const resetPassword = (payload: ResetPasswordData) => api.resetPassword(payload);

export const verifyEmail = (token: string) => api.verifyEmail(token);

export const resendVerificationEmail = (email: string) => api.resendVerificationEmail(email);
