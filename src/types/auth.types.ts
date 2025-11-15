export interface User {
  id: string;
  email: string;
  fullName: string;
  cpf?: string;
  phone?: string;
  birthDate?: string;
  profileImageUrl?: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  isActive: boolean;
  termsAccepted: boolean;
  termsAcceptedAt?: string;
  privacyAccepted: boolean;
  privacyAcceptedAt?: string;
  marketingConsent: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  cpf?: string;
  phone?: string;
  birthDate?: string;
  termsAccepted: boolean;
  privacyAccepted: boolean;
  marketingConsent?: boolean;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  token?: string;
  refreshToken?: string;
}

export interface ValidationError {
  field: string;
  message: string;
}
