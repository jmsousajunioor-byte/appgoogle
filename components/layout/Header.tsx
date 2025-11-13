import React from 'react';
import { Icon } from '../ui/Icon';

interface HeaderProps {
    onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
    return (
        <header className="sticky top-0 bg-neutral-50/80 dark:bg-neutral-800/80 backdrop-blur-sm z-10 flex items-center md:hidden h-16 px-4 border-b border-neutral-200 dark:border-neutral-700">
            <button 
                onClick={onMenuClick} 
                className="p-2 -ml-2 rounded-full text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                aria-label="Abrir menu"
            >
                <Icon icon="menu" className="h-6 w-6" />
            </button>
             <div className="flex items-center space-x-3 ml-4">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                    <Icon icon="pie-chart" className="h-5 w-5 text-white" />
                </div>
                <h1 className="font-heading text-xl font-bold text-neutral-800 dark:text-white">Fintech</h1>
            </div>
        </header>
    );
};

export default Header;
