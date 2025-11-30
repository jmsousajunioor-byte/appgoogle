import React, { useState } from 'react';
import { supabaseClient } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { User } from '../../types';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';

interface ProfilePageProps {
  user: User | null;
  onUpdateUser: (updatedUser: User) => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ user, onUpdateUser }) => {
  if (!user) return <div className="p-8 text-center">Carregando perfil...</div>;

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<User>(user);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [changingPassword, setChangingPassword] = useState(false);
  const { refreshUser } = useAuth();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    onUpdateUser(formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData(user);
    setIsEditing(false);
  };

  const handlePasswordFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
    setPasswordError(null);
    setPasswordSuccess(null);
  };

  const validateNewPassword = () => {
    const { newPassword, confirmPassword } = passwordForm;
    if (newPassword !== confirmPassword) {
      setPasswordError('Nova senha e confirmacao precisam ser iguais.');
      return false;
    }
    const strongEnough =
      newPassword.length >= 8 &&
      /[A-Z]/.test(newPassword) &&
      /[a-z]/.test(newPassword) &&
      /[0-9]/.test(newPassword);
    if (!strongEnough) {
      setPasswordError('Use no minimo 8 caracteres, com letras maiusculas, minusculas e numeros.');
      return false;
    }
    return true;
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);
    if (!validateNewPassword()) return;

    setChangingPassword(true);
    try {
      const { data: currentUser, error: userError } = await supabaseClient.auth.getUser();
      if (userError || !currentUser?.user?.email) {
        setPasswordError('Nao foi possivel identificar sua sessao. Faca login novamente.');
        return;
      }

      // Reautenticamos com a senha atual antes de permitir a troca.
      const { error: signInError } = await supabaseClient.auth.signInWithPassword({
        email: currentUser.user.email,
        password: passwordForm.currentPassword,
      });
      if (signInError) {
        setPasswordError('Senha atual incorreta.');
        return;
      }

      const { error: updateError } = await supabaseClient.auth.updateUser({
        password: passwordForm.newPassword,
      });
      if (updateError) {
        setPasswordError(updateError.message || 'Nao foi possivel atualizar a senha.');
        return;
      }

      setPasswordSuccess('Senha atualizada com sucesso.');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      await refreshUser();
    } catch (error) {
      console.error('Erro ao atualizar senha:', error);
      setPasswordError('Ocorreu um erro ao atualizar a senha.');
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="p-8 space-y-8 min-h-screen">
      <header>
        <h1 className="text-4xl font-heading text-neutral-800 dark:text-neutral-100">Perfil</h1>
        <p className="text-neutral-500 dark:text-neutral-400 mt-1">Gerencie suas informações pessoais e de segurança.</p>
      </header>

      <Card>
        <div className="flex items-center space-x-6 pb-6 border-b border-neutral-200 dark:border-neutral-700">
          <img
            src={user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6366f1&color=fff`}
            alt="Avatar do Usuário"
            className="w-24 h-24 rounded-full border-4 border-indigo-500"
          />
          <div>
            <h2 className="text-3xl font-bold">{user.name}</h2>
            <p className="text-neutral-500">{user.email}</p>
            <Button variant="secondary" size="sm" className="mt-2">Alterar Foto</Button>
          </div>
        </div>

        <div className="pt-6 space-y-4">
          <h3 className="text-lg font-bold">Informações Pessoais</h3>
          {isEditing ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Nome Completo" name="name" value={formData.name} onChange={handleInputChange} />
              <Input label="Email" name="email" type="email" value={formData.email} onChange={handleInputChange} />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-neutral-500">Nome Completo</p>
                <p className="font-semibold">{user.name}</p>
              </div>
              <div>
                <p className="text-neutral-500">Email</p>
                <p className="font-semibold">{user.email}</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-2 mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-700">
          {isEditing ? (
            <>
              <Button variant="secondary" onClick={handleCancel}>Cancelar</Button>
              <Button variant="primary" onClick={handleSave}>Salvar Alteracoes</Button>
            </>
          ) : (
            <Button variant="primary" onClick={() => setIsEditing(true)}>Editar Perfil</Button>
          )}
        </div>
      </Card>

      <Card title="Alterar senha" className="space-y-4">
        <p className="text-neutral-500 dark:text-neutral-400 text-sm">
          Por seguranca, confirme a senha atual e defina uma nova senha forte antes de continuar.
        </p>
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Senha atual"
              name="currentPassword"
              type="password"
              value={passwordForm.currentPassword}
              onChange={handlePasswordFieldChange}
              required
              autoComplete="current-password"
            />
            <Input
              label="Nova senha"
              name="newPassword"
              type="password"
              value={passwordForm.newPassword}
              onChange={handlePasswordFieldChange}
              required
              autoComplete="new-password"
            />
            <Input
              label="Confirmar nova senha"
              name="confirmPassword"
              type="password"
              value={passwordForm.confirmPassword}
              onChange={handlePasswordFieldChange}
              required
              autoComplete="new-password"
            />
          </div>

          <div className="space-y-2">
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Regras: minimo de 8 caracteres, incluindo letras maiusculas, minusculas e numeros.
            </p>
            {passwordError && (
              <p className="text-sm text-red-600 dark:text-red-400">{passwordError}</p>
            )}
            {passwordSuccess && (
              <p className="text-sm text-emerald-600 dark:text-emerald-400">{passwordSuccess}</p>
            )}
          </div>

          <div className="flex justify-end">
            <Button type="submit" variant="primary" disabled={changingPassword}>
              {changingPassword ? 'Atualizando...' : 'Atualizar senha'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ProfilePage;
