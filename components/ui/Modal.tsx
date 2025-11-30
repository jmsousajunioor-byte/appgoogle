import React, { useEffect } from 'react';
import { Icon } from './Icon';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | 'full';
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
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    full: 'max-w-full h-full my-0 rounded-none',
  };

  return (
    <>
      <div className="fixed inset-0 z-50 grid place-items-center pointer-events-none p-4">
        <div 
          role="dialog"
          aria-modal="true"
          className={`modal-glass glass-apply-all modal-container pointer-events-auto w-full flex flex-col transition-all duration-300 transform scale-95 animate-scale-in ${sizeClasses[size]} max-h-[80vh] shadow-[0_4px_20px_rgba(0,0,0,0.15)]`}
          tabIndex={-1}
        >
          {title && (
            <header className="flex justify-between items-center p-6">
              <h2 className="modal-title font-heading text-neutral-800 dark:text-neutral-100">{title}</h2>
              <button 
                onClick={onClose} 
                aria-label="Fechar"
                className="text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-700 dark:hover:text-neutral-300 rounded-full p-2 transition-colors"
              >
                <Icon icon="close" className="h-6 w-6" />
              </button>
            </header>
          )}
          <div className="modal-body p-6 overflow-y-auto flex-1">
            {children}
          </div>
        </div>
      </div>
      <style>{`
        .modal-glass {
          background: transparent !important;
          -webkit-backdrop-filter: blur(14px);
          backdrop-filter: blur(14px);
        }
        @keyframes scale-in {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-scale-in { animation: scale-in 0.2s ease-out forwards; }
        /* Ensure readability on dark glass modal (scope to dark mode only) */
        .dark .modal-glass label,
        .dark .modal-glass .text-neutral-700,
        .dark .modal-glass .text-neutral-600 {
          color: #f8fafc !important;
        }
        .dark .modal-glass .text-neutral-500 {
          color: #e5e7eb !important;
        }
        /* Make inner white card backgrounds transparent so modal glass shows through */
        .modal-glass .bg-white,
        .modal-glass .bg-neutral-50,
        .modal-glass .bg-neutral-100,
        .modal-glass .bg-white\/5,
        .modal-glass .bg-white\/50 {
          background-color: transparent !important;
          box-shadow: none !important;
          border: 0 !important;
        }
        /* Floating controls: no visible container, subtle backdrop blur for depth */
        .modal-glass .select-float {
          background: transparent !important;
          border: 0 !important;
          box-shadow: none !important;
          -webkit-backdrop-filter: none;
          backdrop-filter: none;
        }
        .modal-glass .select-float ul {
          background: transparent !important;
          border: 0 !important;
          box-shadow: none !important;
        }
        /* Enforce glass style for native selects inside modal */
        .modal-glass select {
          appearance: none;
          -webkit-appearance: none;
          -moz-appearance: none;
          background-color: transparent !important;
          -webkit-backdrop-filter: blur(12px);
          backdrop-filter: blur(12px);
          border: 0 !important;
          box-shadow: none !important;
          color: #0f172a;
          background-clip: padding-box;
          padding-right: 1.75rem; /* espaço para seta custom */
        }
        .modal-glass select::-ms-expand { display: none; }
        .modal-glass select::-webkit-textfield-decoration-container { display: none; }
        .dark .modal-glass select {
          background-color: transparent !important;
          border-color: rgba(255, 255, 255, 0.12) !important;
          color: #f8fafc !important;
        }
        .modal-glass select:focus {
          outline: none;
          box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.35);
        }
        /* If a child explicitly sets a rounded container, keep border radius but let the glass show */
        .modal-glass .rounded-2xl,
        .modal-glass .rounded-lg,
        .modal-glass .rounded-3xl {
          background-clip: padding-box;
        }
        .modal-glass :where(header,div,select):not(.card-realistic):not(.card-realistic *) {
          border: 0 !important;
          outline: none !important;
          background-color: transparent !important;
        }
        .modal-glass :is(div,select):not(.card-realistic):not(.card-realistic *):is(:hover,:focus,:active) {
          border: 0 !important;
          outline: none !important;
          background-color: transparent !important;
        }
        /* Preserve card styling */
        .modal-glass .card-realistic,
        .modal-glass .card-realistic * {
          border-radius: inherit;
        }
        .modal-container {
          --modal-padding: 2rem;
          --modal-title-size: 1.8rem;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
          border-top: 1px solid rgba(0,0,0,0.08);
          border-bottom: 1px solid rgba(0,0,0,0.08);
          will-change: transform, width, height;
          overflow-x: hidden;
        }
        .modal-title { font-size: var(--modal-title-size); }
        .modal-body { padding: var(--modal-padding); -webkit-overflow-scrolling: touch; overscroll-behavior-y: contain; }
        @media (max-width: 767px) {
          .modal-container { max-width: 90vw; }
          .modal-container { margin-left: 5vw; margin-right: 5vw; }
          .modal-container { --modal-padding: 1rem; --modal-title-size: 1.2rem; }
        }
        @media (min-width: 768px) and (max-width: 1199px) {
          .modal-container { max-width: 80vw; }
          .modal-container { --modal-padding: 1.5rem; --modal-title-size: 1.5rem; }
        }
        @media (min-width: 1200px) {
          .modal-container { max-width: 60vw; }
          .modal-container { --modal-padding: 2rem; --modal-title-size: 1.8rem; }
        }
        .modal-container { font-size: clamp(1rem, 1.2vw, 1rem); }
      `}</style>
    </>
  );
};

export default Modal;
