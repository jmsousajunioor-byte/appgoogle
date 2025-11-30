import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Loader2, Eye, EyeOff, Sparkles, Chrome, Github } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { loginSchema } from '@/lib/validation';
import { useAuth } from '@/contexts/AuthContext';
import useToast from '@/hooks/useToast';
import { CosmicAuthLayout } from './CosmicAuthLayout';

export const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleRememberMe = (checked: boolean) => {
    setFormData(prev => ({ ...prev, rememberMe: checked }));
    if (errors.rememberMe) {
      setErrors(prev => ({ ...prev, rememberMe: '' }));
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      const validated = loginSchema.parse(formData);
      const response = await login(validated).catch((err: any) => {
        console.error('[LoginForm] Erro login:', err);
        return { success: false, message: err?.message || 'Falha ao conectar ao servidor' };
      });

      if (response.success) {
        toast({
          title: 'Login realizado com sucesso!',
          description: `Bem vindo de volta, ${response.user?.fullName || 'usuario'}!`,
          variant: 'default',
        });
        navigate('/dashboard');
      } else {
        toast({
          title: 'Erro ao fazer login',
          description: response.message || 'Falha ao autenticar. Verifique sua conexão e tente novamente.',
          variant: 'destructive',
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
          title: 'Erro',
          description: 'Ocorreu um erro ao fazer login. Tente novamente.',
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    toast({
      title: `Conectando com ${provider}`,
      description: 'Redirecionando para autenticacao segura...',
      variant: 'default',
    });
  };

  return (
    <CosmicAuthLayout>
      <div className="w-full max-w-md space-y-8 animate-fade-in-up">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-3 rounded-full bg-white/5 px-4 py-2 backdrop-blur">
            <Sparkles className="h-6 w-6 text-cosmic-pink animate-glow-pulse" />
            <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground/80">Gestão de Contas</p>
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-white">Portal de Acesso</h1>
            <p className="text-sm text-muted-foreground">
              Entre para controlar cada detalhe das suas financas em um so lugar.
            </p>
          </div>
        </div>

        <div className="glass rounded-[32px] border border-border/35 bg-card/40 p-8 shadow-[0_8px_32px_rgba(0,0,0,0.45),0_0_60px_hsl(var(--cosmic-purple)/0.2)]">
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
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  className={`pl-11 h-12 bg-input/50 backdrop-blur-sm border-border/40 text-foreground placeholder:text-muted-foreground/70 focus-visible:border-cosmic-blue/60 focus-visible:ring-cosmic-blue/30 ${errors.email ? 'border-destructive animate-shake' : ''
                    }`}
                  disabled={loading}
                />
              </div>
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                Senha
              </label>
              <div className="relative group">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-cosmic-pink" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="********"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  className={`pl-11 pr-11 h-12 bg-input/50 backdrop-blur-sm border-border/40 text-foreground placeholder:text-muted-foreground/70 focus-visible:border-cosmic-pink/60 focus-visible:ring-cosmic-pink/30 ${errors.password ? 'border-destructive animate-shake' : ''
                    }`}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-cosmic-pink"
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-muted-foreground">
                <Checkbox
                  id="rememberMe"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onCheckedChange={handleRememberMe}
                  className="border-border/50 data-[state=checked]:bg-cosmic-purple data-[state=checked]:border-cosmic-purple"
                />
                <span>Lembrar-me</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-cosmic-blue transition-colors hover:text-cosmic-pink"
              >
                Esqueceu a senha?
              </Link>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 text-base font-semibold tracking-wide shadow-[0_15px_45px_rgba(79,70,229,0.35)]"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/30" />
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-[0.3em]">
                <span className="bg-card/70 px-2 text-muted-foreground">ou continue com</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleSocialLogin('Google')}
                className="h-11 gap-2 border-border/40 bg-white/5 text-foreground hover:border-cosmic-blue/60 hover:text-white"
              >
                <Chrome className="h-5 w-5 text-cosmic-blue" />
                Google
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleSocialLogin('GitHub')}
                className="h-11 gap-2 border-border/40 bg-white/5 text-foreground hover:border-cosmic-pink/60 hover:text-white"
              >
                <Github className="h-5 w-5" />
                GitHub
              </Button>
            </div>

            <p className="text-center text-xs text-muted-foreground/80">
              Ao continuar, voce concorda com os nossos termos de uso e politica de privacidade.
            </p>
          </form>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Ainda nao tem uma conta?{' '}
          <Link to="/register" className="text-cosmic-blue hover:text-cosmic-pink">
            Comece agora
          </Link>
        </p>
      </div>
    </CosmicAuthLayout>
  );
};

export default LoginForm;
