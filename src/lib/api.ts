import type {
  AuthResponse,
  ForgotPasswordData,
  LoginCredentials,
  RegisterData,
  ResetPasswordData,
  User,
} from '@/types/auth.types';
import { supabaseClient } from '@/lib/supabaseClient'; // <-- CORREÇÃO CRÍTICA
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';

const getConfiguredRedirectBase = () => {
  // Prioritize current origin (browser) to support preview deployments
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  const fromEnv =
    import.meta.env.VITE_SUPABASE_REDIRECT_URL ||
    import.meta.env.VITE_APP_URL ||
    import.meta.env.VITE_SITE_URL;

  if (fromEnv) {
    return fromEnv.replace(/\/$/, '');
  }

  return undefined;
};

const buildRedirectUrl = (path: string) => {
  const base = getConfiguredRedirectBase();
  if (!base) return undefined;
  if (/^https?:\/\//i.test(path)) {
    return path;
  }
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const trimmedBase = base.replace(/\/+$/, '');
  if (trimmedBase.endsWith(normalizedPath)) {
    return trimmedBase;
  }
  return `${trimmedBase}${normalizedPath}`;
};

const mapSupabaseUser = (supabaseUser: SupabaseUser | null): User | undefined => {
  if (!supabaseUser || !supabaseUser.email) return undefined;

  const metadata = (supabaseUser.user_metadata || {}) as Record<string, any>;

  return {
    id: supabaseUser.id,
    email: supabaseUser.email,
    fullName:
      (metadata.fullName as string | undefined) ??
      (metadata.full_name as string | undefined) ??
      supabaseUser.email.split('@')[0],
    cpf: metadata.cpf as string | undefined,
    phone: metadata.phone as string | undefined,
    birthDate: metadata.birthDate as string | undefined,
    profileImageUrl: metadata.profileImageUrl as string | undefined,
    emailVerified: Boolean(supabaseUser.email_confirmed_at),
    phoneVerified: Boolean(metadata.phoneVerified),
    isActive: !supabaseUser.banned_until,
    termsAccepted: Boolean(metadata.termsAccepted),
    termsAcceptedAt: (metadata.termsAcceptedAt as string | undefined) ?? undefined,
    privacyAccepted: Boolean(metadata.privacyAccepted),
    privacyAcceptedAt: (metadata.privacyAcceptedAt as string | undefined) ?? undefined,
    marketingConsent: Boolean(metadata.marketingConsent),
    createdAt: supabaseUser.created_at,
    updatedAt: supabaseUser.updated_at ?? supabaseUser.created_at,
    lastLogin: supabaseUser.last_sign_in_at ?? undefined,
  };
};

const buildAuthResponse = (options: {
  user: SupabaseUser | null;
  session: Session | null;
  message: string;
  success: boolean;
}): AuthResponse => {
  const appUser = mapSupabaseUser(options.user);

  return {
    success: options.success,
    message: options.message,
    user: appUser,
    token: options.session?.access_token,
    refreshToken: options.session?.refresh_token,
  };
};

const handleSupabaseException = (error: unknown, fallbackMessage: string): AuthResponse => {
  const message =
    error instanceof Error && error.message ? error.message : fallbackMessage;
  console.error('[Supabase Auth error]', error);
  return {
    success: false,
    message,
  };
};

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  try {
    const { email, password } = credentials;
    const { data, error } = await withTimeout(
      supabaseClient.auth.signInWithPassword({
        email,
        password,
      }),
      8000,
      'login',
    );

    if (error || !data.user) {
      return {
        success: false,
        message: error?.message ?? 'Erro ao fazer login',
      };
    }

    return buildAuthResponse({
      user: data.user,
      session: data.session,
      message: 'Login realizado com sucesso',
      success: true,
    });
  } catch (error) {
    return handleSupabaseException(error, 'Erro ao fazer login');
  }
};

export const register = async (payload: RegisterData): Promise<AuthResponse> => {
  try {
    const {
      email,
      password,
      fullName,
      cpf,
      phone,
      birthDate,
      termsAccepted,
      privacyAccepted,
      marketingConsent,
    } = payload;

    const redirectTo = buildRedirectUrl('/reset-password');

    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectTo,
        data: {
          fullName,
          cpf,
          phone,
          birthDate,
          termsAccepted,
          termsAcceptedAt: new Date().toISOString(),
          privacyAccepted,
          privacyAcceptedAt: new Date().toISOString(),
          marketingConsent: Boolean(marketingConsent),
        },
      },
    });

    if (error || !data.user) {
      return {
        success: false,
        message: error?.message ?? 'Erro ao criar conta',
      };
    }

    // Create profile in public.users table
    const { error: profileError } = await supabaseClient
      .from('users')
      .insert([
        {
          id: data.user.id,
          name: fullName,
          email: email,
          membership: 'Free',
        },
      ]);

    if (profileError) {
      console.error('Erro ao criar perfil do usuário:', profileError);
      // Optional: Attempt to cleanup auth user if profile creation fails
      // await supabaseClient.auth.admin.deleteUser(data.user.id);
      return {
        success: false,
        message: 'Erro ao criar perfil do usuário. Tente novamente.',
      };
    }

    return buildAuthResponse({
      user: data.user,
      session: data.session,
      message: 'Cadastro realizado com sucesso',
      success: true,
    });
  } catch (error) {
    return handleSupabaseException(error, 'Erro ao criar conta');
  }
};

export const logout = async (): Promise<void> => {
  await supabaseClient.auth.signOut();
};

export const verifyToken = async (): Promise<AuthResponse> => {
  try {
    const { data, error } = await withTimeout(
      supabaseClient.auth.getUser(),
      6000,
      'verifyToken',
    );

    if (error || !data.user) {
      return {
        success: false,
        message: error?.message ?? 'Sessão não encontrada',
      };
    }

    return buildAuthResponse({
      user: data.user,
      session: null,
      message: 'Sessão válida',
      success: true,
    });
  } catch (error) {
    return handleSupabaseException(error, 'Erro ao verificar sessão');
  }
};

export const forgotPassword = async (payload: ForgotPasswordData): Promise<AuthResponse> => {
  try {
    const redirectTo = buildRedirectUrl('/reset-password');

    const { error } = await supabaseClient.auth.resetPasswordForEmail(payload.email, {
      redirectTo,
    });

    if (error) {
      const friendlyMessage =
        error.status === 429
          ? 'Foi enviada uma solicitacao recentemente. Aguarde antes de tentar novamente.'
          : error.message ?? 'Erro ao solicitar redefinicao de senha';
      return {
        success: false,
        message: friendlyMessage,
      };
    }

    return {
      success: true,
      message: 'Email de redefinição de senha enviado',
    };
  } catch (error) {
    return handleSupabaseException(error, 'Erro ao solicitar redefinição de senha');
  }
};

export const resetPassword = async (payload: ResetPasswordData): Promise<AuthResponse> => {
  try {
    const { password } = payload;

    const { data, error } = await supabaseClient.auth.updateUser({
      password,
    });

    if (error || !data.user) {
      return {
        success: false,
        message: error?.message ?? 'Erro ao redefinir senha',
      };
    }

    return buildAuthResponse({
      user: data.user,
      session: null,
      message: 'Senha redefinida com sucesso',
      success: true,
    });
  } catch (error) {
    return handleSupabaseException(error, 'Erro ao redefinir senha');
  }
};

export const verifyEmail = async (_token: string): Promise<AuthResponse> => {
  try {
    const { data, error } = await supabaseClient.auth.getUser();

    if (error || !data.user) {
      return {
        success: false,
        message: error?.message ?? 'Não foi possível verificar o email',
      };
    }

    return buildAuthResponse({
      user: data.user,
      session: null,
      message: 'Email verificado ou pendente de verificação pelo Supabase',
      success: true,
    });
  } catch (error) {
    return handleSupabaseException(error, 'Não foi possível verificar o email');
  }
};

export const resendVerificationEmail = async (email: string): Promise<AuthResponse> => {
  try {
    const redirectTo = buildRedirectUrl('/');

    const { data, error } = await supabaseClient.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo,
      },
    });

    if (error) {
      return {
        success: false,
        message: error.message ?? 'Não foi possível reenviar o email de verificação',
      };
    }

    return {
      success: true,
      message: 'Email de verificação reenviado (via magic link do Supabase)',
      user: data.user ? mapSupabaseUser(data.user) : undefined,
    };
  } catch (error) {
    return handleSupabaseException(error, 'Não foi possível reenviar o email de verificação');
  }
};
const withTimeout = async <T>(promise: Promise<T>, ms: number, label: string): Promise<T> => {
  let timeoutId: any;
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(`[timeout] ${label} após ${ms}ms`)), ms);
  });
  try {
    const result = await Promise.race([promise, timeout]);
    clearTimeout(timeoutId);
    return result as T;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
};
