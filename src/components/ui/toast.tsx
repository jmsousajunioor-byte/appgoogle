import React, { createContext, useCallback, useContext, useState } from 'react';

type ToastVariant = 'default' | 'destructive' | 'success';

export interface ToastOptions {
  id?: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

interface ToastInternal extends ToastOptions {
  id: string;
}

interface ToastContextValue {
  toast: (options: ToastOptions) => string;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const createId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
};

export const ToastProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastInternal[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const toast = useCallback(
    (options: ToastOptions) => {
      const id = options.id ?? createId();
      const nextToast: ToastInternal = {
        id,
        variant: 'default',
        ...options,
      };

      setToasts(prev => [...prev, nextToast]);

      if (options.duration !== 0) {
        window.setTimeout(() => dismiss(id), options.duration ?? 4000);
      }

      return id;
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-4 z-50 mx-auto flex w-full max-w-md flex-col gap-3 px-4">
        {toasts.map(item => (
          <div
            key={item.id}
            className={`pointer-events-auto rounded-2xl border border-border/40 bg-card/80 p-4 shadow-lg backdrop-blur ${
              item.variant === 'destructive'
                ? 'border-red-500/60 text-red-200'
                : item.variant === 'success'
                  ? 'border-emerald-500/60 text-emerald-200'
                  : 'text-foreground'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                {item.title && <p className="text-sm font-semibold">{item.title}</p>}
                {item.description && <p className="text-xs text-muted-foreground">{item.description}</p>}
              </div>
              <button
                type="button"
                className="text-xs uppercase tracking-wide text-muted-foreground hover:text-foreground"
                onClick={() => dismiss(item.id)}
              >
                fechar
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToastContext = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast deve ser usado dentro de ToastProvider');
  }
  return context;
};
