import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { resetPasswordSchema } from '@/lib/validation';
import { resetPassword } from '@/lib/api';
import useToast from '@/hooks/useToast';

export const ResetPasswordForm: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    token: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [passwordReset, setPasswordReset] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [tokenValid, setTokenValid] = useState(true);

  useEffect(() => {
    const token = searchParams.get('token') ?? searchParams.get('access_token');
    if (!token) {
      setTokenValid(false);
      toast({
        title: 'Token inválido',
        description: 'O link de redefinição é inválido ou expirou.',
        variant: 'destructive',
      });
    } else {
      setFormData(prev => ({ ...prev, token }));
    }
  }, [searchParams]);

  const calculatePasswordStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 12.5;
    if (/[^A-Za-z0-9]/.test(password)) strength += 12.5;
    return strength;
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      const validated = resetPasswordSchema.parse(formData);
      const response = await resetPassword(validated);

      if (response.success) {
        setPasswordReset(true);
        toast({
          title: '✅ Senha redefinida!',
          description: 'Sua senha foi alterada com sucesso.',
        });

        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        toast({
        title: 'Token inválido',
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
        title: 'Token inválido',
          description: 'Ocorreu um erro ao redefinir sua senha.',
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
    if (passwordStrength < 75) return 'Média';
    return 'Forte';
  };

  if (!tokenValid) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-purple-900 via-blue-900 to-pink-900 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="stars" />
          <div className="stars2" />
          <div className="stars3" />
        </div>
        <Card className="w-full max-w-md relative z-10 bg-black/40 backdrop-blur-xl border-red-500/50 shadow-2xl shadow-red-500/20 rounded-3xl">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
                <XCircle className="h-10 w-10 text-red-400" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-red-400">Token inválido</CardTitle>
            <CardDescription className="text-gray-300">
        description: 'O link de redefinição é inválido ou expirou.',
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex flex-col space-y-3">
            <Link to="/forgot-password" className="w-full">
              <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500">
                Solicitar novo link
              </Button>
            </Link>
            <Link to="/login" className="text-sm text-purple-400 hover:text-purple-300 text-center">
              Voltar para o login
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-purple-900 via-blue-900 to-pink-900 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="stars" />
        <div className="stars2" />
        <div className="stars3" />
      </div>

      <Card className="w-full max-w-md relative z-10 bg-black/40 backdrop-blur-xl border-purple-500/50 shadow-2xl shadow-purple-500/20 rounded-3xl animate-fadeIn">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/50">
              <span className="text-3xl">{passwordReset ? '✅' : '🔒'}</span>
            </div>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            {passwordReset ? 'Senha Redefinida!' : 'Nova senha'}
          </CardTitle>
          <CardDescription className="text-gray-300">
            {passwordReset ? 'Redirecionando para o login...' : 'Crie uma nova senha segura para sua conta'}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {passwordReset ? (
            <div className="space-y-4">
              <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-4 flex items-start space-x-3">
                <CheckCircle2 className="h-6 w-6 text-green-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-green-400">Senha alterada com sucesso!</p>
                  <p className="text-sm text-gray-300">Você será redirecionado para o login em instantes.</p>
                </div>
              </div>
              <Link to="/login" className="block">
                <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500">
                  Ir para o login agora
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-gray-200">
                  Nova senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-purple-400" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className={`pl-10 pr-10 bg-white/10 border-purple-500/50 text-white placeholder:text-gray-400 focus:border-purple-400 focus:ring-purple-400/50 ${
                      errors.password ? 'border-red-500' : ''
                    }`}
                    disabled={loading}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-400 hover:text-purple-300"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {formData.password && (
                  <div className="space-y-1">
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${getPasswordStrengthColor()}`}
                        style={{ width: `${passwordStrength}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-300">
                      Força da senha: <span className="font-semibold">{getPasswordStrengthText()}</span>
                    </p>
                  </div>
                )}
                {errors.password && <p className="text-sm text-red-400">{errors.password}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-200">
                  Confirmar senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-purple-400" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`pl-10 pr-10 bg-white/10 border-purple-500/50 text-white placeholder:text-gray-400 focus:border-purple-400 focus:ring-purple-400/50 ${
                      errors.confirmPassword ? 'border-red-500' : ''
                    }`}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(prev => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-400 hover:text-purple-300"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-sm text-red-400">{errors.confirmPassword}</p>}
              </div>

              <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
                <p className="text-xs text-gray-300 mb-2 font-medium">Sua senha deve conter:</p>
                <ul className="text-xs text-gray-400 space-y-1">
                  <li className="flex items-center space-x-2">
                    <span className={formData.password.length >= 8 ? 'text-green-400' : 'text-gray-500'}>
                      {formData.password.length >= 8 ? '✓' : '○'}
                    </span>
                    <span>Mínimo de 8 caracteres</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className={/[A-Z]/.test(formData.password) ? 'text-green-400' : 'text-gray-500'}>
                      {/[A-Z]/.test(formData.password) ? '✓' : '○'}
                    </span>
                    <span>Uma letra maiúscula</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className={/[a-z]/.test(formData.password) ? 'text-green-400' : 'text-gray-500'}>
                      {/[a-z]/.test(formData.password) ? '✓' : '○'}
                    </span>
                    <span>Uma letra minúscula</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className={/[0-9]/.test(formData.password) ? 'text-green-400' : 'text-gray-500'}>
                      {/[0-9]/.test(formData.password) ? '✓' : '○'}
                    </span>
                    <span>Um número</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className={/[^A-Za-z0-9]/.test(formData.password) ? 'text-green-400' : 'text-gray-500'}>
                      {/[^A-Za-z0-9]/.test(formData.password) ? '✓' : '○'}
                    </span>
                    <span>Um caractere especial</span>
                  </li>
                </ul>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold py-6 rounded-xl shadow-lg shadow-purple-500/50 transition-all duration-300 hover:scale-105 hover:shadow-purple-500/70"
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
          )}
        </CardContent>

        {!passwordReset && (
          <CardFooter className="flex justify-center">
            <Link to="/login" className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
              Voltar para o login
            </Link>
          </CardFooter>
        )}
      </Card>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.6s ease-out; }
        .stars, .stars2, .stars3 {
          position: absolute; inset: 0;
          background-image:
            radial-gradient(2px 2px at 20px 30px, white, rgba(0,0,0,0)),
            radial-gradient(2px 2px at 60px 70px, white, rgba(0,0,0,0)),
            radial-gradient(1px 1px at 50px 50px, white, rgba(0,0,0,0)),
            radial-gradient(1px 1px at 130px 80px, white, rgba(0,0,0,0)),
            radial-gradient(2px 2px at 90px 10px, white, rgba(0,0,0,0));
          background-repeat: repeat;
          background-size: 200px 200px;
          animation: zoom 20s infinite;
          opacity: 0.5;
        }
        .stars2 { animation: zoom 40s infinite; opacity: 0.3; }
        .stars3 { animation: zoom 60s infinite; opacity: 0.2; }
        @keyframes zoom {
          0% { transform: scale(1); }
          50% { transform: scale(1.5); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default ResetPasswordForm;