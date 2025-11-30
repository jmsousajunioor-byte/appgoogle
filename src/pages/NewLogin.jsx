import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import useToast from '@/hooks/useToast';

const NewLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    const savedRememberMe = localStorage.getItem('rememberMe') === 'true';
    if (savedEmail && savedRememberMe) {
      setFormData(prev => ({ ...prev, email: savedEmail, rememberMe: true }));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email é obrigatório';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Email inválido';
    if (!formData.password) newErrors.password = 'Senha é obrigatória';
    else if (formData.password.length < 6) newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      if (formData.rememberMe) {
        localStorage.setItem('rememberedEmail', formData.email);
        localStorage.setItem('rememberMe', 'true');
      } else {
        localStorage.removeItem('rememberedEmail');
        localStorage.removeItem('rememberMe');
      }
      const response = await login({ email: formData.email, password: formData.password, rememberMe: formData.rememberMe }).catch((err) => {
        console.error('[NewLogin] Erro no login:', err);
        return { success: false, message: err?.message || 'Falha ao conectar ao servidor' };
      });
      if (response.success) {
        toast({ title: 'Login realizado com sucesso!', description: `Bem-vindo de volta, ${response.user?.fullName || 'usuário'}!`, variant: 'default' });
        navigate('/dashboard');
      } else {
        toast({ title: 'Erro ao fazer login', description: response.message || 'Credenciais inválidas. Verifique seu email e senha.', variant: 'destructive' });
      }
    } catch (error) {
      console.error('Erro inesperado no login:', error);
      toast({ title: 'Erro', description: 'Ocorreu um erro inesperado. Tente novamente.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => navigate('/forgot-password');
  const handleRegister = () => navigate('/register');

  const dimensoes = { altura: 700, largura: 450 };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4" style={{ background: 'linear-gradient(to bottom right, #15445C, #102835, #113A42, #0E2A43, #143247)' }}>
        <div id="login-wrapper" className="relative rounded-[21px] p-[2px] bg-transparent">
          <div id="login-container" className="rounded-[19px] border-1 border-white mx-auto flex flex-col items-center backdrop-blur-sm bg-white/5" style={{ height: dimensoes.altura, width: dimensoes.largura, maxWidth: '90vw', maxHeight: '90vh', padding: '50px 50px 50px 50px', borderColor: '#ffffff', borderWidth: 1, borderStyle: 'solid', borderRadius: 19, boxShadow: '0 4px 10px rgba(2,6,23,0.2), 0 12px 40px rgba(2,6,23,0.35), inset  5px 5px 5px rgba(255,255,255,0.06)' }}>
        <div className="text-center mb-8 w-full">
          <h1 className="text-3xl font-bold text-white mb-2">Bem-vindo de volta</h1>
          <p className="text-white/80 text-sm">Entre para acessar sua conta</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-[400px]">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-white/90 flex items-center gap-2">
              <Mail className="h-4 w-4 text-white/60" />
              <span>Email</span>
            </label>
            <div>
              <input id="email" name="email" type="email" placeholder="seu@email.com" value={formData.email} onChange={handleChange} autoComplete="email" className="w-full h-12 bg-white/25 rounded-[10px] border border-white/60 backdrop-blur-lg pl-4 pr-4 text-white placeholder:text-white/60 text-left focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 hover:border-indigo-500 shadow-sm shadow-indigo-900/10 hover:shadow-lg hover:shadow-indigo-500/20 focus:shadow-lg focus:shadow-indigo-500/20 transition-colors duration-200" disabled={loading} />
            </div>
          {errors.email && <p className="text-sm text-red-300">{errors.email}</p>}
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-white/90 flex items-center gap-2">
              <Lock className="h-4 w-4 text-white/60" />
              <span>Senha</span>
            </label>
            <div className="relative">
              <input id="password" name="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={formData.password} onChange={handleChange} autoComplete="current-password" className="w-full h-12 bg-white/25 rounded-[10px] border border-white/60 backdrop-blur-lg pl-4 pr-11 text-white placeholder:text-white/60 text-left focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 hover:border-indigo-500 shadow-sm shadow-indigo-900/10 hover:shadow-lg hover:shadow-indigo-500/20 focus:shadow-lg focus:shadow-indigo-500/20 transition-colors duration-200" disabled={loading} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors" aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}>
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.password && <p className="text-sm text-red-300">{errors.password}</p>}
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-white/80 text-sm cursor-pointer">
              <input type="checkbox" name="rememberMe" checked={formData.rememberMe} onChange={handleChange} className="w-4 h-4 rounded border-white/60 bg-white/25 text-white focus:ring-white/50" />
              <span>Lembrar-me</span>
            </label>
            <button type="button" onClick={handleForgotPassword} className="text-white/80 hover:text-white text-sm underline transition-colors">Esqueceu a senha?</button>
          </div>
          <button type="submit" disabled={loading} className="w-full h-12 inline-flex items-center justify-center font-bold rounded-[10px] shadow-xl shadow-indigo-900/25 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-neutral-900 transition-all duration-200 transform hover:scale-105 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:shadow-2xl hover:shadow-indigo-500/60 focus:ring-indigo-500">
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white/60 border-t-white rounded-full animate-spin" />
                <span>Entrando...</span>
              </div>
            ) : (
              'Entrar'
            )}
          </button>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex-1 border-t border-white/20"></div>
              <span className="text-xs uppercase text-white/60">OU CONTINUE COM</span>
              <div className="flex-1 border-t border-white/20"></div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <button type="button" className="h-11 inline-flex items-center justify-center gap-2 font-medium rounded-[10px] bg-white/10 backdrop-blur-md border border-white/20 text-white/90 hover:bg-white/20 hover:border-white/30 transition-all duration-200">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google
              </button>
              
              <button type="button" className="h-11 inline-flex items-center justify-center gap-2 font-medium rounded-[10px] bg-white/10 backdrop-blur-md border border-white/20 text-white/90 hover:bg-white/20 hover:border-white/30 transition-all duration-200">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                </svg>
                GitHub
              </button>
            </div>
            
            <p className="text-center text-xs text-white/50 leading-relaxed">
              Ao continuar, você concorda com os nossos{' '}
              <button type="button" className="underline hover:text-white/70 transition-colors">termos de uso</button>
              {' '}e{' '}
              <button type="button" className="underline hover:text-white/70 transition-colors">política de privacidade</button>
            </p>
          </div>
          
          <p className="text-center text-white/80 text-sm">
            Ainda não tem uma conta?{' '}
            <button type="button" onClick={handleRegister} className="text-white hover:text-white/90 underline transition-colors">Comece agora</button>
          </p>
        </form>
            </div>
          </div>
    </div>
  );
};

export default NewLogin;
