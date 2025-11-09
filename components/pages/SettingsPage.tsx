import React, { useContext } from 'react';
import { ThemeContext } from '../../App';
import Card from '../ui/Card';

const SettingsPage: React.FC = () => {
  const { theme, setTheme } = useContext(ThemeContext);

  const handleThemeChange = (selectedTheme: 'light' | 'dark') => {
    setTheme(selectedTheme);
  };

  return (
    <div className="p-8 space-y-8 min-h-screen">
      <header>
        <h1 className="text-4xl font-heading text-neutral-800 dark:text-neutral-100">Configurações</h1>
        <p className="text-neutral-500 dark:text-neutral-400 mt-1">Personalize a aparência e as notificações do aplicativo.</p>
      </header>

      <Card>
        <h3 className="text-lg font-bold mb-4">Aparência</h3>
        <div className="space-y-2">
          <p className="text-sm text-neutral-600 dark:text-neutral-300">Tema do Aplicativo</p>
          <div className="flex space-x-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 p-1">
            <button 
              onClick={() => handleThemeChange('light')}
              className={`w-full p-2 rounded-md font-bold text-sm transition-colors ${
                theme === 'light' ? 'bg-white shadow text-indigo-600' : 'text-neutral-500'
              }`}
            >
              Claro
            </button>
            <button 
              onClick={() => handleThemeChange('dark')}
              className={`w-full p-2 rounded-md font-bold text-sm transition-colors ${
                theme === 'dark' ? 'bg-neutral-900 shadow text-indigo-400' : 'text-neutral-500'
              }`}
            >
              Escuro
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SettingsPage;
