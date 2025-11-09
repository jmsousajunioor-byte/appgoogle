import React from 'react';
import { Icon } from '../ui/Icon';
import type { Page, User } from '../../types';

interface SidebarProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  user: User;
  isOpen: boolean;
  onClose: () => void;
}

const NavItem: React.FC<{ icon: React.ComponentProps<typeof Icon>['icon']; label: string; page: Page; currentPage: Page; onClick: (page: Page) => void; }> = ({ icon, label, page, currentPage, onClick }) => {
  const isActive = currentPage === page;
  return (
    <a
      href="#"
      onClick={(e) => { e.preventDefault(); onClick(page); }}
      className={`flex items-center space-x-4 px-4 py-3 rounded-xl transition-all duration-200 group ${
        isActive
          ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold shadow-lg'
          : 'text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-700 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-white'
      }`}
    >
      <Icon icon={icon} className={`h-6 w-6 transition-all duration-200 ${isActive ? 'text-white' : 'text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-300'}`} />
      <span className="text-base">{label}</span>
    </a>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ currentPage, setCurrentPage, user, isOpen, onClose }) => {
  const navItems: { icon: React.ComponentProps<typeof Icon>['icon']; label: string; page: Page }[] = [
    { icon: 'dashboard', label: 'Dashboard', page: 'dashboard' },
    { icon: 'credit-card', label: 'Cartões de Crédito', page: 'credit-cards' },
    { icon: 'bank', label: 'Contas Bancárias', page: 'bank-accounts' },
    { icon: 'transactions', label: 'Transações', page: 'transactions' },
    { icon: 'bar-chart', label: 'Relatórios', page: 'reports' },
    { icon: 'budget', label: 'Orçamentos e Metas', page: 'budgets' },
    { icon: 'user', label: 'Perfil', page: 'profile' },
    { icon: 'cog', label: 'Configurações', page: 'settings' },
  ];

  const handleNavClick = (page: Page) => {
    setCurrentPage(page);
    onClose();
  };

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/60 z-20 transition-opacity md:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
        aria-hidden="true"
      ></div>
      <aside className={`w-72 bg-white dark:bg-neutral-900 flex-shrink-0 p-6 flex flex-col shadow-2xl z-30 fixed inset-y-0 left-0 transform transition-transform duration-300 ease-in-out md:shadow-none md:relative md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center space-x-3 mb-10">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Icon icon="pie-chart" className="h-7 w-7 text-white" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-neutral-800 dark:text-white">Fintech</h1>
        </div>

        <div className="flex items-center space-x-4 mb-10">
          <img src={user.avatarUrl} alt="User Avatar" className="w-12 h-12 rounded-full border-2 border-indigo-500" />
          <div>
            <p className="font-bold text-neutral-800 dark:text-neutral-100">{user.name}</p>
            <span className="text-sm text-neutral-500 dark:text-neutral-400">{user.membership} Member</span>
          </div>
        </div>

        <nav className="flex-1 flex flex-col space-y-2">
          {navItems.map(item => (
            <NavItem key={item.page} {...item} currentPage={currentPage} onClick={handleNavClick} />
          ))}
        </nav>

        <div className="mt-auto">
          <a href="#" className="flex items-center space-x-4 px-4 py-3 text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-xl transition-all duration-200">
            <Icon icon="logout" className="h-6 w-6 text-neutral-400" />
            <span className="dark:text-neutral-400">Logout</span>
          </a>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
