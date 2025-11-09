import React, { useEffect } from 'react';
import { Icon } from './Icon';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title, size = 'md' }) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);
  
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full h-full my-0 rounded-none',
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className={`bg-white dark:bg-neutral-800 rounded-3xl shadow-2xl w-full flex flex-col transition-transform duration-300 transform scale-95 animate-scale-in ${sizeClasses[size]}`}
        onClick={e => e.stopPropagation()}
      >
        {title && (
          <header className="flex justify-between items-center p-6 border-b border-neutral-200 dark:border-neutral-700">
            <h2 className="text-xl font-heading text-neutral-800 dark:text-neutral-100">{title}</h2>
            <button 
              onClick={onClose} 
              className="text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-700 dark:hover:text-neutral-300 rounded-full p-2 transition-colors"
            >
              <Icon icon="close" className="h-6 w-6" />
            </button>
          </header>
        )}
        <div className="p-6 overflow-y-auto flex-1">
          {children}
        </div>
      </div>
      <style>{`
        @keyframes scale-in {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-scale-in { animation: scale-in 0.2s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default Modal;