import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail,
  Lock,
  User,
  Phone,
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
import { CosmicAuthLayout } from './CosmicAuthLayout';
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator';

export const RegisterForm: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
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

  // Memoized password validation
  const passwordChecks = useMemo(() => ({
    length: formData.password.length >= 8,
    upper: /[A-Z]/.test(formData.password),
    lower: /[a-z]/.test(formData.password),
    number: /[0-9]/.test(formData.password),
    special: /[^A-Za-z0-9]/.test(formData.password),
  }), [formData.password]);

  const passwordMeetsAllChecks = useMemo(
    () => Object.values(passwordChecks).every(Boolean),
    [passwordChecks]
  );

  const formatPhone = (value: string) =>
    value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = event.target;
    let newValue = value;

    if (name === 'phone') newValue = formatPhone(value);

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : newValue,
    }));

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
      if (error.issues) {
        const newErrors: Record<string, string> = {};
        error.issues.forEach((issue: any) => {
          const field = issue.path[0] as string;
          if (!newErrors[field]) {
            newErrors[field] = issue.message;
          }
        });
        setErrors(newErrors);
        toast({
          title: 'Verifique os dados',
          description: 'Por favor, corrija os erros indicados no formulário.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Erro Inesperado',
          description: 'Ocorreu um erro. Tente novamente.',
          variant: 'destructive'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const isInvalid = (name: keyof typeof formData) => !!errors[name];

  return (
    <CosmicAuthLayout>
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
              {/* Username */}
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium text-foreground">
                  Usuário *
                </label>
                <div className="relative group">
                  <User className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-cosmic-blue" />
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="Seu nome de usuário"
                    value={formData.username}
                    onChange={handleChange}
                    className={`pl-11 h-12 bg-input/50 backdrop-blur-sm border-border/40 text-foreground placeholder:text-muted-foreground/70 focus-visible:border-cosmic-blue/60 focus-visible:ring-cosmic-blue/30 ${isInvalid('username') ? 'border-destructive animate-shake' : ''
                      }`}
                    disabled={loading}
                  />
                </div>
                {errors.username && <p className="text-sm text-destructive">{errors.username}</p>}
              </div>

              {/* Full Name */}
              <div className="space-y-2">
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
                    className={`pl-11 h-12 bg-input/50 backdrop-blur-sm border-border/40 text-foreground placeholder:text-muted-foreground/70 focus-visible:border-cosmic-blue/60 focus-visible:ring-cosmic-blue/30 ${isInvalid('fullName') ? 'border-destructive animate-shake' : ''
                      }`}
                    disabled={loading}
                  />
                </div>
                {errors.fullName && <p className="text-sm text-destructive">{errors.fullName}</p>}
              </div>

              {/* Email */}
              <div className="space-y-2">
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
                    className={`pl-11 h-12 bg-input/50 backdrop-blur-sm border-border/40 text-foreground placeholder:text-muted-foreground/70 focus-visible:border-cosmic-blue/60 focus-visible:ring-cosmic-blue/30 ${isInvalid('email') ? 'border-destructive animate-shake' : ''
                      }`}
                    disabled={loading}
                    autoComplete="email"
                  />
                </div>
                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
              </div>

              {/* Phone */}
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
                    inputMode="tel"
                    placeholder="(00) 00000-0000"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`pl-11 h-12 bg-input/50 backdrop-blur-sm border-border/40 text-foreground placeholder:text-muted-foreground/70 focus-visible:border-cosmic-blue/60 focus-visible:ring-cosmic-blue/30 ${errors.phone ? 'border-destructive animate-shake' : ''
                      }`}
                    disabled={loading}
                    autoComplete="tel"
                  />
                </div>
                {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
              </div>

              {/* Password Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:col-span-2 items-start pt-4 border-t border-border/20">
                {/* Password */}
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
                      className={`pl-11 pr-11 h-12 bg-input/50 backdrop-blur-sm border-border/40 text-foreground placeholder:text-muted-foreground/70 focus-visible:border-cosmic-pink/60 focus-visible:ring-cosmic-pink/30 ${!passwordMeetsAllChecks && formData.password.length > 0 ? 'border-destructive' : ''
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
                  {errors.password && <p className="text-sm text-destructive mt-1">{errors.password}</p>}
                  {!passwordMeetsAllChecks && formData.password.length > 0 && !errors.password && (
                    <p className="text-sm text-destructive mt-1">A senha deve atender a todos os critérios.</p>
                  )}

                  {/* Password Checklist */}
                  <div className="mt-2 text-xs text-muted-foreground space-y-1">
                    <p className="font-medium text-foreground/80">Sua senha deve conter:</p>
                    <div className="grid grid-cols-1 gap-1">
                      {[
                        { label: 'Min. 8 caracteres', met: passwordChecks.length },
                        { label: '1 letra maiúscula', met: passwordChecks.upper },
                        { label: '1 letra minúscula', met: passwordChecks.lower },
                        { label: '1 número', met: passwordChecks.number },
                        { label: '1 caractere especial', met: passwordChecks.special },
                      ].map((req) => (
                        <div
                          key={req.label}
                          className={`flex items-center gap-1 ${req.met ? 'text-emerald-400' : formData.password.length > 0 ? 'text-destructive' : 'text-muted-foreground'
                            }`}
                        >
                          <span
                            className={`inline-flex h-4 w-4 items-center justify-center rounded-full border text-[10px] ${req.met
                                ? 'border-emerald-400 bg-emerald-500/10'
                                : formData.password.length > 0
                                  ? 'border-destructive/60 bg-destructive/10'
                                  : 'border-border/50'
                              }`}
                          >
                            {req.met ? '✓' : '•'}
                          </span>
                          <span>{req.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Confirm Password */}
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
                      className={`pl-11 pr-11 h-12 bg-input/50 backdrop-blur-sm border-border/40 text-foreground placeholder:text-muted-foreground/70 focus-visible:border-cosmic-pink/60 focus-visible:ring-cosmic-pink/30 ${formData.confirmPassword && formData.password !== formData.confirmPassword ? 'border-destructive' : ''
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
                  {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
                  {!errors.confirmPassword && formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <p className="text-sm text-destructive">As senhas não coincidem.</p>
                  )}
                </div>
              </div>

              {/* Password Strength */}
              <div className="space-y-2 md:col-span-2">
                <PasswordStrengthIndicator password={formData.password} />
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="space-y-4 rounded-3xl border border-border/30 bg-black/10 p-4">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="termsAccepted"
                  checked={formData.termsAccepted}
                  onCheckedChange={handleCheckbox('termsAccepted')}
                  className={`border-border/50 data-[state=checked]:bg-cosmic-purple data-[state=checked]:border-cosmic-purple mt-1 ${isInvalid('termsAccepted') ? 'border-destructive' : ''
                    }`}
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
                  className={`border-border/50 data-[state=checked]:bg-cosmic-purple data-[state=checked]:border-cosmic-purple mt-1 ${isInvalid('privacyAccepted') ? 'border-destructive' : ''
                    }`}
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
              {errors.privacyAccepted && <p className="text-sm text-destructive">{errors.privacyAccepted}</p>}

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
    </CosmicAuthLayout>
  );
};

export default RegisterForm;
