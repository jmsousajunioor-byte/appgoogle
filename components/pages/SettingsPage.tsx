import React, { useContext, useState } from 'react';
import { ThemeContext } from '../../contexts/ThemeContext';
import UICard from '../ui/Card';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import { Card as CardType, NotificationItem, RecurringTransaction, Category } from '../../types';

interface SettingsPageProps {
  cards: CardType[];
  notifications: NotificationItem[];
  recurrences: RecurringTransaction[];
  onAddRecurrence: (input: { description: string; amount: number; category: Category; cardId: string; dayOfMonth: number; startDate?: string; endDate?: string; }) => void;
  onToggleRecurrence: (id: string, active: boolean) => void;
  onDeleteRecurrence: (id: string) => void;
  onMarkNotificationRead: (id: string) => void;
  onClearNotifications: () => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ cards, notifications, recurrences, onAddRecurrence, onToggleRecurrence, onDeleteRecurrence, onMarkNotificationRead, onClearNotifications }) => {
  const { theme, setTheme } = useContext(ThemeContext);
  const [recForm, setRecForm] = useState({ description: '', amount: '', category: Category.Food as Category, cardId: cards[0]?.id || '', dayOfMonth: '1' });

  const handleThemeChange = (selectedTheme: 'light' | 'dark') => {
    setTheme(selectedTheme);
  };

  return (
    <div className="p-8 space-y-8 min-h-screen">
      <header>
        <h1 className="text-4xl font-heading text-neutral-800 dark:text-neutral-100">Configurações</h1>
        <p className="text-neutral-500 dark:text-neutral-400 mt-1">Personalize preferências, recorrências e notificações.</p>
      </header>

      <UICard>
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
      </UICard>

      <UICard title="Notificações">
        <div className="space-y-3">
          <div className="flex justify-end">
            <Button size="sm" variant="secondary" onClick={onClearNotifications}>Limpar Todas</Button>
          </div>
          <ul className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {notifications.length === 0 && <li className="py-3 text-neutral-500">Sem notificações</li>}
            {notifications.map(n => (
              <li key={n.id} className="py-2 flex items-center justify-between">
                <div>
                  <div className="font-bold">{n.title}</div>
                  <div className="text-sm text-neutral-500">{n.message}</div>
                </div>
                <div className="flex items-center gap-2">
                  {!n.read && <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500 text-white">Nova</span>}
                  {!n.read && <Button size="sm" variant="secondary" onClick={() => onMarkNotificationRead(n.id)}>Marcar lida</Button>}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </UICard>

      <UICard title="Recorrências">
        <form className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end" onSubmit={(e)=>{e.preventDefault(); const amount=parseFloat(recForm.amount||'0'); if(!recForm.description||!Number.isFinite(amount)||amount<=0) return; onAddRecurrence({ description: recForm.description, amount, category: recForm.category, cardId: recForm.cardId, dayOfMonth: parseInt(recForm.dayOfMonth,10)||1 }); setRecForm({ ...recForm, description:'', amount:'' }); }}>
          <Input label="Descrição" name="desc" value={recForm.description} onChange={e=>setRecForm({...recForm, description:e.target.value})} />
          <Input label="Valor" name="valor" type="number" step="0.01" value={recForm.amount} onChange={e=>setRecForm({...recForm, amount:e.target.value})} />
          <Select label="Categoria" name="categoria" value={recForm.category} onChange={e=>setRecForm({...recForm, category:e.target.value as any})}>
            {Object.values(Category).map(c => <option key={c} value={c}>{c}</option>)}
          </Select>
          <Select label="Cartão" name="cartao" value={recForm.cardId} onChange={e=>setRecForm({...recForm, cardId:e.target.value})}>
            {cards.map(c => <option key={c.id} value={c.id}>{c.nickname} (••{c.last4})</option>)}
          </Select>
          <Input label="Dia do mês" name="dia" type="number" min="1" max="28" value={recForm.dayOfMonth} onChange={e=>setRecForm({...recForm, dayOfMonth:e.target.value})} />
          <div className="md:col-span-5 flex justify-end">
            <Button type="submit">Adicionar Recorrência</Button>
          </div>
        </form>
        <div className="mt-4">
          <ul className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {recurrences.length === 0 && <li className="py-3 text-neutral-500">Nenhuma recorrência</li>}
            {recurrences.map(r => (
              <li key={r.id} className="py-2 flex items-center justify-between">
                <div className="text-sm">
                  <div className="font-bold">{r.description} — {r.category}</div>
                  <div className="text-neutral-500">Dia {r.dayOfMonth} — {r.active ? 'Ativa' : 'Inativa'}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="secondary" onClick={()=>onToggleRecurrence(r.id, !r.active)}>{r.active? 'Desativar':'Ativar'}</Button>
                  <Button size="sm" variant="ghost" onClick={()=>onDeleteRecurrence(r.id)}>Excluir</Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </UICard>
    </div>
  );
};

export default SettingsPage;
