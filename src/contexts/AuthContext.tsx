import React, { createContext, useContext, useEffect, useState } from 'react';
import type { AuthResponse, LoginCredentials, RegisterData, User } from '@/types/auth.types';
import { supabaseClient } from '@/lib/supabaseClient';
import * as auth from '@/lib/auth';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  register: (data: RegisterData) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  recoveryMode: boolean;
  enterRecoveryMode: () => void;
  clearRecoveryMode: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [recoveryMode, setRecoveryMode] = useState(false);

  const checkAuth = async () => {
    try {
      // Fail-fast com timeout: evita loop infinito se Supabase travar
      const sessionPromise = supabaseClient.auth.getSession();
      const timeoutPromise = new Promise<{ data: { session: null } }>((resolve) =>
        setTimeout(() => resolve({ data: { session: null } }), 3500),
      );
      const { data } = await Promise.race([sessionPromise, timeoutPromise]);

      if (!data.session) {
        const fallback = auth.getPersistedUser();
        if (fallback.success && fallback.user) {
          setUser(fallback.user);
          setRecoveryMode(false);
          setLoading(false);
          return;
        }
        setUser(null);
        setLoading(false);
        return;
      }

      const response = await auth.verifySession();
      if (response.success && response.user) {
        setUser(response.user);
        setRecoveryMode(false);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Erro ao verificar autenticacao:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void checkAuth();
  }, []);

  const loginHandler = async (credentials: LoginCredentials) => {
    const response = await auth.login(credentials);
    if (response.success && response.user) {
      setUser(response.user);
      setRecoveryMode(false);
    }
    return response;
  };

  const registerHandler = async (payload: RegisterData) => {
    const response = await auth.register(payload);
    if (response.success && response.user) {
      setUser(response.user);
      setRecoveryMode(false);
    }
    return response;
  };

  const logoutHandler = async () => {
    await auth.logout();
    setUser(null);
    setRecoveryMode(false);
  };

  useEffect(() => {
    const { data: subscription } = supabaseClient.auth.onAuthStateChange(async (event, session) => {
      console.log('[AuthContext] Auth event:', event);

      if (event === 'PASSWORD_RECOVERY') {
        setRecoveryMode(true);
        return;
      }

      if (event === 'SIGNED_OUT') {
        setUser(null);
        setRecoveryMode(false);
        setLoading(false);
        return;
      }

      if (event === 'SIGNED_IN' && session) {
        // Verify session and get user data
        try {
          const response = await auth.verifySession();
          if (response.success && response.user) {
            setUser(response.user);
            // Don't clear recovery mode here, as SIGNED_IN might follow PASSWORD_RECOVERY
            // setRecoveryMode(false); 
          } else {
            setUser(null);
          }
        } catch (error) {
          console.error('[AuthContext] Error verifying session:', error);
          setUser(null);
        } finally {
          setLoading(false);
        }
      }

      if (event === 'TOKEN_REFRESHED' && session) {
        // Just update loading state, keep existing user
        setLoading(false);
      }
    });

    return () => {
      subscription?.subscription.unsubscribe();
    };
  }, []);

  const refreshUser = async () => {
    await checkAuth();
  };

  const enterRecoveryMode = () => setRecoveryMode(true);
  const clearRecoveryMode = () => setRecoveryMode(false);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login: loginHandler,
        register: registerHandler,
        logout: logoutHandler,
        refreshUser,
        recoveryMode,
        enterRecoveryMode,
        clearRecoveryMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
};
