import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail,
  Lock,
  User,
  Phone,
  Calendar,
  FileText,
  Eye,
  EyeOff,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { registerSchema } from '@/lib/validation';
import { useAuth } from '@/contexts/AuthContext';
import useToast from '@/hooks/useToast';
import { TermsOfServiceModal } from '@/components/auth/TermsOfServiceModal';
import { PrivacyPolicyModal } from '@/components/auth/PrivacyPolicyModal';

export const RegisterForm: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    cpf: '',
    phone: '',
    birthDate: '',
    termsAccepted: false,
    privacyAccepted: false,
    marketingConsent: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const calculatePasswordStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 12.5;
    if (/[^A-Za-z0-9]/.test(password)) strength += 12.5;
    return strength;
  };

  const formatCPF = (value: string) =>
    value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');

  const formatPhone = (value: string) =>
    value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = event.target;
    let newValue = value;

    if (name === 'cpf') newValue = formatCPF(value);
    if (name === 'phone') newValue = formatPhone(value);

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : newValue,
    }));

    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(newValue));
    }

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleCheckbox = (name: keyof typeof formData) => (checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      const validated = registerSchema.parse(formData);
      const response = await register(validated);

      if (response.success) {
        toast({
          title: 'Cadastro realizado com sucesso!',
          description: 'Enviamos um email de verificacao. Confirme o seu email para prosseguir.',
          variant: 'default',
        });
        navigate('/verify-email');
      } else {
        toast({
          title: 'Erro ao criar conta',
          description: response.message,
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
          description: 'Ocorreu um erro ao criar sua conta. Tente novamente.',
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 25) return 'bg-red-500';
    if (passwordStrength < 50) return 'bg-orange-500';
    if (passwordStrength < 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength < 25) return 'Muito fraca';
    if (passwordStrength < 50) return 'Fraca';
    if (passwordStrength < 75) return 'Media';
    return 'Forte';
  };

  return (
    <div className="cosmic-login relative min-h-screen w-full overflow-hidden bg-background text-foreground">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-cosmic-purple/25 via-background to-cosmic-blue/20" />
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute -top-24 -right-24 h-[36rem] w-[36rem] rounded-full bg-cosmic blur-[200px] opacity-50 animate-spin-slow" />
          <div className="absolute -bottom-32 -left-28 h-[28rem] w-[28rem] rounded-full bg-cosmic blur-[200px] opacity-50 animate-float" />
          <div className="absolute left-24 top-16 h-24 w-24 rounded-full border border-cosmic-blue/40 opacity-70 animate-spin-slow" />
          <div className="absolute right-8 bottom-20 h-28 w-28 rounded-full border border-cosmic-pink/40 opacity-60 animate-float-slow" />
        </div>
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-4xl space-y-8 animate-fade-in-up">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-3 rounded-full bg-white/5 px-4 py-2 backdrop-blur">
              <Sparkles className="h-6 w-6 text-cosmic-pink animate-glow-pulse" />
              <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground/80">Fintech Fusion</p>
            </div>
            <div className="space-y-1">
              <h1 className="text-3xl font-bold text-white">Crie sua conta</h1>
              <p className="text-sm text-muted-foreground">
                Preencha os dados abaixo para comecar a controlar suas financas com estilo cosmico.
              </p>
            </div>
          </div>

          <div className="glass rounded-[32px] border border-border/35 bg-card/40 p-8 shadow-[0_8px_32px_rgba(0,0,0,0.45),0_0_60px_hsl(var(--cosmic-purple)/0.2)]">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <label htmlFor="fullName" className="text-sm font-medium text-foreground">
                    Nome completo *
                  </label>
                  <div className="relative group">
                    <User className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-cosmic-blue" />
                    <Input
                      id="fullName"
                      name="fullName"
                      type="text"
                      placeholder="Seu nome completo"
                      value={formData.fullName}
                      onChange={handleChange}
                      className={`pl-11 h-12 bg-input/50 backdrop-blur-sm border-border/40 text-foreground placeholder:text-muted-foreground/70 focus-visible:border-cosmic-blue/60 focus-visible:ring-cosmic-blue/30 ${
                        errors.fullName ? 'border-destructive animate-shake' : ''
                      }`}
                      disabled={loading}
                    />
                  </div>
                  {errors.fullName && <p className="text-sm text-destructive">{errors.fullName}</p>}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label htmlFor="email" className="text-sm font-medium text-foreground">
                    Email *
                  </label>
                  <div className="relative group">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-cosmic-blue" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={formData.email}
                      onChange={handleChange}
                      className={`pl-11 h-12 bg-input/50 backdrop-blur-sm border-border/40 text-foreground placeholder:text-muted-foreground/70 focus-visible:border-cosmic-blue/60 focus-visible:ring-cosmic-blue/30 ${
                        errors.email ? 'border-destructive animate-shake' : ''
                      }`}
                      disabled={loading}
                      autoComplete="email"
                    />
                  </div>
                  {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <label htmlFor="cpf" className="text-sm font-medium text-foreground">
                    CPF (opcional)
                  </label>
                  <div className="relative group">
                    <FileText className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-cosmic-blue" />
                    <Input
                      id="cpf"
                      name="cpf"
                      type="text"
                      inputMode="numeric"
                      placeholder="000.000.000-00"
                      value={formData.cpf}
                      onChange={handleChange}
                      className={`pl-11 h-12 bg-input/50 backdrop-blur-sm border-border/40 text-foreground placeholder:text-muted-foreground/70 focus-visible:border-cosmic-blue/60 focus-visible:ring-cosmic-blue/30 ${
                        errors.cpf ? 'border-destructive animate-shake' : ''
                      }`}
                      disabled={loading}
                    />
                  </div>
                  {errors.cpf && <p className="text-sm text-destructive">{errors.cpf}</p>}
                </div>

                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-medium text-foreground">
                    Telefone (opcional)
                  </label>
                  <div className="relative group">
                    <Phone className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-cosmic-blue" />
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="(00) 00000-0000"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`pl-11 h-12 bg-input/50 backdrop-blur-sm border-border/40 text-foreground placeholder:text-muted-foreground/70 focus-visible:border-cosmic-blue/60 focus-visible:ring-cosmic-blue/30 ${
                        errors.phone ? 'border-destructive animate-shake' : ''
                      }`}
                      disabled={loading}
                      autoComplete="tel"
                    />
                  </div>
                  {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
                </div>

                <div className="space-y-2">
                  <label htmlFor="birthDate" className="text-sm font-medium text-foreground">
                    Data de nascimento (opcional)
                  </label>
                  <div className="relative group">
                    <Calendar className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-cosmic-blue" />
                    <Input
                      id="birthDate"
                      name="birthDate"
                      type="text"
                      placeholder="dd/mm/aaaa"
                      value={formData.birthDate}
                      onChange={handleChange}
                      className={`pl-11 h-12 bg-input/50 backdrop-blur-sm border-border/40 text-foreground placeholder:text-muted-foreground/70 focus-visible:border-cosmic-blue/60 focus-visible:ring-cosmic-blue/30 ${
                        errors.birthDate ? 'border-destructive animate-shake' : ''
                      }`}
                      disabled={loading}
                    />
                  </div>
                  {errors.birthDate && <p className="text-sm text-destructive">{errors.birthDate}</p>}
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-foreground">
                    Senha *
                  </label>
                  <div className="relative group">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-cosmic-pink" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="********"
                      value={formData.password}
                      onChange={handleChange}
                      className={`pl-11 pr-11 h-12 bg-input/50 backdrop-blur-sm border-border/40 text-foreground placeholder:text-muted-foreground/70 focus-visible:border-cosmic-pink/60 focus-visible:ring-cosmic-pink/30 ${
                        errors.password ? 'border-destructive animate-shake' : ''
                      }`}
                      disabled={loading}
                      autoComplete="new-password"
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

                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
                    Confirmar senha *
                  </label>
                  <div className="relative group">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-cosmic-pink" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="********"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`pl-11 pr-11 h-12 bg-input/50 backdrop-blur-sm border-border/40 text-foreground placeholder:text-muted-foreground/70 focus-visible:border-cosmic-pink/60 focus-visible:ring-cosmic-pink/30 ${
                        errors.confirmPassword ? 'border-destructive animate-shake' : ''
                      }`}
                      disabled={loading}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(prev => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-cosmic-pink"
                      aria-label={showConfirmPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-sm text-destructive">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Forca da senha</span>
                  <span>{getPasswordStrengthText()}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-border/40 overflow-hidden">
                  <div
                    className={`${getPasswordStrengthColor()} h-full rounded-full transition-all duration-300`}
                    style={{ width: `${passwordStrength}%` }}
                    aria-hidden="true"
                  />
                </div>
              </div>

              <div className="space-y-4 rounded-3xl border border-border/30 bg-black/10 p-4">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="termsAccepted"
                    checked={formData.termsAccepted}
                    onCheckedChange={handleCheckbox('termsAccepted')}
                    className="border-border/50 data-[state=checked]:bg-cosmic-purple data-[state=checked]:border-cosmic-purple mt-1"
                  />
                  <label htmlFor="termsAccepted" className="text-sm text-muted-foreground leading-relaxed">
                    Eu aceito os{' '}
                    <TermsOfServiceModal>
                      <button type="button" className="text-cosmic-blue hover:text-cosmic-pink underline">
                        Termos de Uso
                      </button>
                    </TermsOfServiceModal>{' '}
                    *
                  </label>
                </div>
                {errors.termsAccepted && <p className="text-sm text-destructive">{errors.termsAccepted}</p>}

                <div className="flex items-start gap-3">
                  <Checkbox
                    id="privacyAccepted"
                    checked={formData.privacyAccepted}
                    onCheckedChange={handleCheckbox('privacyAccepted')}
                    className="border-border/50 data-[state=checked]:bg-cosmic-purple data-[state=checked]:border-cosmic-purple mt-1"
                  />
                  <label htmlFor="privacyAccepted" className="text-sm text-muted-foreground leading-relaxed">
                    Eu aceito a{' '}
                    <PrivacyPolicyModal>
                      <button type="button" className="text-cosmic-blue hover:text-cosmic-pink underline">
                        Politica de Privacidade e LGPD
                      </button>
                    </PrivacyPolicyModal>{' '}
                    *
                  </label>
                </div>
                {errors.privacyAccepted && (
                  <p className="text-sm text-destructive">{errors.privacyAccepted}</p>
                )}

                <div className="flex items-start gap-3">
                  <Checkbox
                    id="marketingConsent"
                    checked={formData.marketingConsent}
                    onCheckedChange={handleCheckbox('marketingConsent')}
                    className="border-border/50 data-[state=checked]:bg-cosmic-purple data-[state=checked]:border-cosmic-purple mt-1"
                  />
                  <label htmlFor="marketingConsent" className="text-sm text-muted-foreground leading-relaxed">
                    Desejo receber novidades e promocoes por email (opcional)
                  </label>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 text-base font-semibold tracking-wide shadow-[0_15px_45px_rgba(79,70,229,0.35)]"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Criando conta...
                  </>
                ) : (
                  'Criar conta'
                )}
              </Button>
            </form>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Ja tem uma conta?{' '}
            <Link to="/login" className="text-cosmic-blue transition-colors hover:text-cosmic-pink">
              Faca login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

const handleSubmit = async (event: React.FormEvent) => {
  event.preventDefault();
  setErrors({});
  setLoading(true);

  try {
    const validated = registerSchema.parse(formData);
    const response = await register(validated);

    console.log('RESPOSTA DO REGISTER:', response); // <-- adiciona isso aqui

    if (response.success) {
      toast({
        title: 'Cadastro realizado com sucesso!',
        description: 'Enviamos um email de verificacao. Confirme o seu email para prosseguir.',
        variant: 'default',
      });
      navigate('/verify-email');
    } else {
      toast({
        title: 'Erro ao criar conta',
        description: response.message,
        variant: 'destructive',
      });
    }
  } catch (error: any) {
    console.error('ERRO NO HANDLE SUBMIT:', error); // <-- pode adicionar isso também
    if (error?.errors) {
      const newErrors: Record<string, string> = {};
      error.errors.forEach((issue: any) => {
        newErrors[issue.path[0]] = issue.message;
      });
      setErrors(newErrors);
    } else {
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao criar sua conta. Tente novamente.',
        variant: 'destructive',
      });
    }
  } finally {
    setLoading(false);
  }
};


export default RegisterForm;
