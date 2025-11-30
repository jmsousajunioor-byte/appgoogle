import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, Loader2, CheckCircle2, XCircle, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { resetPasswordSchema } from '@/lib/validation';
import { supabaseClient } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import useToast from '@/hooks/useToast';
import { CosmicAuthLayout } from './CosmicAuthLayout';
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator';
import { PasswordRequirements } from './PasswordRequirements';

export const ResetPasswordForm: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { enterRecoveryMode, clearRecoveryMode, recoveryMode, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [passwordReset, setPasswordReset] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);

  // Token validation - handles Supabase hash fragments and AuthContext state
  useEffect(() => {
    // If password was just reset, don't validate token anymore
    if (passwordReset) return;

    // 1. If AuthContext already detected recovery mode, we are good.
    if (recoveryMode) {
      console.log('[ResetPassword] Recovery mode active from context');
      setTokenValid(true);
      return;
    }

    // 2. Check URL for tokens
    // Hash params (Implicit flow): #access_token=...&type=recovery
    const hash = window.location.hash.substring(1);
    const hashParams = new URLSearchParams(hash);
    const accessToken = hashParams.get('access_token');

    // Query params (PKCE flow): ?token_hash=...&type=recovery
    const tokenHash = searchParams.get('token_hash');
    const type = hashParams.get('type') || searchParams.get('type');

    console.log('[ResetPassword] Checking URL:', {
      accessToken: !!accessToken,
      tokenHash: !!tokenHash,
      type
    });

    // Case A: Implicit Flow (access_token in hash)
    // Supabase client handles this automatically, we just wait for session
    if (accessToken && type === 'recovery') {
      console.log('[ResetPassword] Implicit flow detected');
      enterRecoveryMode();
      const checkSession = async () => {
        const { data } = await supabaseClient.auth.getSession();
        if (data.session) {
          setTokenValid(true);
          window.history.replaceState({}, '', '/reset-password');
        } else {
          setTimeout(async () => {
            const { data: retryData } = await supabaseClient.auth.getSession();
            setTokenValid(!!retryData.session);
          }, 1000);
        }
      };
      checkSession();
      return;
    }

    // Case B: PKCE Flow (token_hash in query)
    // We MUST manually verify the OTP
    if (tokenHash && type === 'recovery') {
      console.log('[ResetPassword] PKCE flow detected, verifying OTP...');
      enterRecoveryMode();

      const verifyPkce = async () => {
        try {
          const { data, error } = await supabaseClient.auth.verifyOtp({
            token_hash: tokenHash,
            type: 'recovery',
          });

          if (error) {
            console.error('[ResetPassword] PKCE verification failed:', error);
            setTokenValid(false);
          } else if (data.session) {
            console.log('[ResetPassword] PKCE verification successful');
            setTokenValid(true);
            // Clean up URL
            window.history.replaceState({}, '', '/reset-password');
          } else {
            console.warn('[ResetPassword] PKCE success but no session?');
            setTokenValid(false);
          }
        } catch (err) {
          console.error('[ResetPassword] Unexpected error during PKCE verify:', err);
          setTokenValid(false);
        }
      };
      verifyPkce();
      return;
    }

    // 3. Fallback: If user is authenticated, assume they can reset (maybe hash was stripped already)
    if (isAuthenticated) {
      console.log('[ResetPassword] User is authenticated, allowing reset');
      setTokenValid(true);
      return;
    }

    console.log('[ResetPassword] No valid token found');
    setTokenValid(false);
  }, [searchParams, enterRecoveryMode, recoveryMode, isAuthenticated, passwordReset]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      const validated = resetPasswordSchema.parse(formData);

      const { error } = await supabaseClient.auth.updateUser({
        password: validated.password
      });

      if (error) throw error;

      // Set success state immediately
      setPasswordReset(true);

      // Clear recovery mode and local storage
      clearRecoveryMode();
      localStorage.removeItem('last_recovery_email');

      toast({
        title: 'Sucesso!',
        description: 'Senha redefinida com sucesso.',
        variant: 'success'
      });

      // Sign out after a delay, but the UI should already be showing success
      setTimeout(() => supabaseClient.auth.signOut(), 1000);

    } catch (error: any) {
      if (error?.errors) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((e: any) => { newErrors[e.path[0]] = e.message; });
        setErrors(newErrors);
      } else {
        toast({
          title: 'Erro',
          description: error.message || 'Tente novamente.',
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // 1. Success state - PRIORITY: Check this FIRST to prevent "Invalid Link" flash
  if (passwordReset) {
    return (
      <CosmicAuthLayout>
        <div className="w-full max-w-md space-y-8 animate-fade-in-up">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-3 rounded-full bg-white/5 px-4 py-2 backdrop-blur">
              <Sparkles className="h-6 w-6 text-cosmic-pink animate-glow-pulse" />
              <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground/80">Recuperação de Senha</p>
            </div>
          </div>

          <div className="glass rounded-[32px] border border-border/35 bg-card/40 p-8 shadow-[0_8px_32px_rgba(0,0,0,0.45),0_0_60px_hsl(var(--cosmic-purple)/0.2)]">
            <div className="text-center space-y-6">
              <CheckCircle2 className="h-16 w-16 text-emerald-500 mx-auto" />
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white">Senha atualizada!</h2>
                <p className="text-sm text-muted-foreground">Sua senha foi redefinida com sucesso.</p>
              </div>
              <Button
                onClick={() => {
                  // Force full reload to clear any auth state artifacts and go to login
                  window.location.href = '/login';
                }}
                className="w-full h-12 text-base font-semibold shadow-[0_15px_45px_rgba(79,70,229,0.35)]"
              >
                Ir para login
              </Button>
            </div>
          </div>
        </div>
      </CosmicAuthLayout>
    );
  }

  // 2. Loading state
  if (tokenValid === null) {
    return (
      <CosmicAuthLayout>
        <div className="text-center space-y-4 animate-fade-in-up">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-cosmic-purple" />
          <p className="text-lg text-muted-foreground">Validando link...</p>
        </div>
      </CosmicAuthLayout>
    );
  }

  // 3. Invalid token
  if (tokenValid === false) {
    return (
      <CosmicAuthLayout>
        <div className="w-full max-w-md space-y-8 animate-fade-in-up">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-3 rounded-full bg-white/5 px-4 py-2 backdrop-blur">
              <Sparkles className="h-6 w-6 text-cosmic-pink animate-glow-pulse" />
              <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground/80">Recuperação de Senha</p>
            </div>
          </div>

          <div className="glass rounded-[32px] border border-border/35 bg-card/40 p-8 shadow-[0_8px_32px_rgba(0,0,0,0.45),0_0_60px_hsl(var(--cosmic-purple)/0.2)]">
            <div className="text-center space-y-6">
              <XCircle className="h-16 w-16 text-destructive mx-auto" />
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white">Link inválido</h2>
                <p className="text-sm text-muted-foreground">O link expirou ou já foi usado.</p>
              </div>
              <div className="space-y-3 pt-4">
                <Button
                  onClick={() => navigate('/forgot-password')}
                  className="w-full h-12 text-base font-semibold shadow-[0_15px_45px_rgba(79,70,229,0.35)]"
                >
                  Solicitar novo link
                </Button>
                <Button
                  onClick={() => navigate('/login')}
                  variant="ghost"
                  className="w-full text-cosmic-blue hover:text-cosmic-pink"
                >
                  Voltar ao login
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CosmicAuthLayout>
    );
  }

  // 4. Form
  return (
    <CosmicAuthLayout>
      <div className="w-full max-w-md space-y-8 animate-fade-in-up">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-3 rounded-full bg-white/5 px-4 py-2 backdrop-blur">
            <Sparkles className="h-6 w-6 text-cosmic-pink animate-glow-pulse" />
            <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground/80">Recuperação de Senha</p>
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-white">Redefinir senha</h1>
            <p className="text-sm text-muted-foreground">Crie uma nova senha segura</p>
          </div>
        </div>

        <div className="glass rounded-[32px] border border-border/35 bg-card/40 p-8 shadow-[0_8px_32px_rgba(0,0,0,0.45),0_0_60px_hsl(var(--cosmic-purple)/0.2)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                Nova Senha
              </label>
              <div className="relative group">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-cosmic-pink" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  className={`pl-11 pr-11 h-12 bg-input/50 backdrop-blur-sm border-border/40 text-foreground placeholder:text-muted-foreground/70 focus-visible:border-cosmic-pink/60 focus-visible:ring-cosmic-pink/30 ${errors.password ? 'border-destructive animate-shake' : ''}`}
                  disabled={loading}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-cosmic-pink"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <PasswordStrengthIndicator password={formData.password} />
              {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
                Confirmar Senha
              </label>
              <div className="relative group">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-cosmic-blue" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`pl-11 pr-11 h-12 bg-input/50 backdrop-blur-sm border-border/40 text-foreground placeholder:text-muted-foreground/70 focus-visible:border-cosmic-blue/60 focus-visible:ring-cosmic-blue/30 ${errors.confirmPassword ? 'border-destructive animate-shake' : ''}`}
                  disabled={loading}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-cosmic-blue"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
            </div>

            <PasswordRequirements password={formData.password} />

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 text-base font-semibold tracking-wide shadow-[0_15px_45px_rgba(79,70,229,0.35)]"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Redefinindo...
                </>
              ) : (
                'Redefinir senha'
              )}
            </Button>
          </form>
        </div>
      </div>
    </CosmicAuthLayout>
  );
};

export default ResetPasswordForm;