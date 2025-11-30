import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from './components/ui/Button';
import Input from './components/ui/Input';
import UICard from './components/ui/Card';
import { supabase } from '@/lib/auth'; // Corrigido: Importando supabase do local correto

const ResetPasswordPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    try {
      // O Supabase usa o token da URL automaticamente quando esta função é chamada
      // na página de destino do link de redefinição.
      const { error: updateError } = await supabase.auth.updateUser({ password });

      if (updateError) {
        throw updateError;
      }

      setSuccess('Senha redefinida com sucesso! Você será redirecionado para o login.');

      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError('Ocorreu um erro ao redefinir sua senha. O link pode ter expirado. Tente novamente.');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <UICard title="Redefinir Senha">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Nova Senha"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Input
              label="Confirmar Nova Senha"
              name="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
            {success && <p className="text-sm text-emerald-600 dark:text-emerald-400">{success}</p>}
            <Button type="submit" variant="primary" className="w-full">
              Redefinir Senha
            </Button>
          </form>
        </UICard>
      </div>
    </div>
  );
};

export default ResetPasswordPage;