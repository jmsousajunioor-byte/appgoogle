import React, { createContext, useContext, useEffect, useState } from 'react';
import type { AuthResponse, LoginCredentials, RegisterData, User } from '@/types/auth.types';
import * as auth from '@/lib/auth';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  register: (data: RegisterData) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const response = await auth.verifySession();
      if (response.success && response.user) {
        setUser(response.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
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
    }
    return response;
  };

  const registerHandler = async (payload: RegisterData) => {
    const response = await auth.register(payload);
    if (response.success && response.user) {
      setUser(response.user);
    }
    return response;
  };

  const logoutHandler = async () => {
    await auth.logout();
    setUser(null);
  };

  const refreshUser = async () => {
    await checkAuth();
  };

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
