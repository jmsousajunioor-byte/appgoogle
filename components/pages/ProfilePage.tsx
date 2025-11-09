import React, { useState } from 'react';
import { User } from '../../types';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';

interface ProfilePageProps {
  user: User;
  onUpdateUser: (updatedUser: User) => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ user, onUpdateUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<User>(user);

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

  return (
    <div className="p-8 space-y-8 min-h-screen">
      <header>
        <h1 className="text-4xl font-heading text-neutral-800 dark:text-neutral-100">Perfil</h1>
        <p className="text-neutral-500 dark:text-neutral-400 mt-1">Gerencie suas informações pessoais e de segurança.</p>
      </header>

      <Card>
        <div className="flex items-center space-x-6 pb-6 border-b border-neutral-200 dark:border-neutral-700">
          <img src={user.avatarUrl} alt="User Avatar" className="w-24 h-24 rounded-full border-4 border-indigo-500" />
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
                    <Button variant="primary" onClick={handleSave}>Salvar Alterações</Button>
                </>
            ) : (
                <Button variant="primary" onClick={() => setIsEditing(true)}>Editar Perfil</Button>
            )}
        </div>
      </Card>
    </div>
  );
};

export default ProfilePage;
