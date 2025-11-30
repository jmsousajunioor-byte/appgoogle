import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, CheckCircle2, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { forgotPasswordSchema } from '@/lib/validation';
import { supabaseClient } from '@/lib/supabaseClient';
import useToast from '@/hooks/useToast';
import { CosmicAuthLayout } from './CosmicAuthLayout';

export const ForgotPasswordForm: React.FC = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      const validated = forgotPasswordSchema.parse({ email });
      const { error } = await supabaseClient.auth.resetPasswordForEmail(validated.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast({
          title: '❌ Erro',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        setEmailSent(true);
        if (typeof window !== 'undefined') {
          window.localStorage.setItem('last_recovery_email', validated.email);
        }
        toast({
          title: '✅ Email enviado!',
          description: 'Verifique sua caixa de entrada para redefinir sua senha.',
        });
      }
    } catch (error: any) {
      if (error?.errors) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((issue: any) => {
          newErrors[issue.path[0]] = issue.message;
        });
        setErrors(newErrors);
      } else {
        toast({
          title: '❌ Erro',
          description: 'Ocorreu um erro. Tente novamente.',
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <CosmicAuthLayout>
      <div className="w-full max-w-md space-y-8 animate-fade-in-up">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-3 rounded-full bg-white/5 px-4 py-2 backdrop-blur">
            <Sparkles className="h-6 w-6 text-cosmic-pink animate-glow-pulse" />
            <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground/80">Recuperação de Conta</p>
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-white">
              {emailSent ? 'Email Enviado!' : 'Esqueceu sua senha?'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {emailSent
                ? 'Enviamos instruções para redefinir sua senha'
                : 'Digite seu email para receber instruções de recuperação'}
            </p>
          </div>
        </div>

        <div className="glass rounded-[32px] border border-border/35 bg-card/40 p-8 shadow-[0_8px_32px_rgba(0,0,0,0.45),0_0_60px_hsl(var(--cosmic-purple)/0.2)]">
          {emailSent ? (
            <div className="space-y-6">
              <div className="flex items-start gap-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-4">
                <CheckCircle2 className="h-6 w-6 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-emerald-400">Email enviado com sucesso!</p>
                  <p className="text-sm text-muted-foreground">
                    Verifique sua caixa de entrada em <strong className="text-white">{email}</strong>. Se não encontrar, veja o spam.
                  </p>
                </div>
              </div>
              <Button
                onClick={() => {
                  setEmailSent(false);
                  setEmail('');
                  if (typeof window !== 'undefined') {
                    window.localStorage.removeItem('last_recovery_email');
                  }
                }}
                variant="outline"
                className="w-full h-12 border-border/40 bg-white/5 text-foreground hover:border-cosmic-purple/60 hover:text-white"
              >
                Enviar novamente
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-foreground">
                  Email
                </label>
                <div className="relative group">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-cosmic-blue" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="voce@email.com"
                    value={email}
                    onChange={event => {
                      setEmail(event.target.value);
                      if (errors.email) setErrors({});
                    }}
                    autoComplete="email"
                    className={`pl-11 h-12 bg-input/50 backdrop-blur-sm border-border/40 text-foreground placeholder:text-muted-foreground/70 focus-visible:border-cosmic-blue/60 focus-visible:ring-cosmic-blue/30 ${errors.email ? 'border-destructive animate-shake' : ''
                      }`}
                    disabled={loading}
                    autoFocus
                  />
                </div>
                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 text-base font-semibold tracking-wide shadow-[0_15px_45px_rgba(79,70,229,0.35)]"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  'Enviar instruções'
                )}
              </Button>
            </form>
          )}
        </div>

        <div className="text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm text-cosmic-blue hover:text-cosmic-pink transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar para o login</span>
          </Link>
        </div>
      </div>
    </CosmicAuthLayout>
  );
};

export default ForgotPasswordForm;
