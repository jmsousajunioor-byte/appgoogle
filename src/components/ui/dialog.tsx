import React, { createContext, useContext, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface DialogContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const DialogContext = createContext<DialogContextValue | null>(null);

export const Dialog: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [open, setOpen] = useState(false);
  return <DialogContext.Provider value={{ open, setOpen }}>{children}</DialogContext.Provider>;
};

const useDialogContext = () => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('Dialog components must be used within <Dialog>');
  }
  return context;
};

export const DialogTrigger: React.FC<React.HTMLAttributes<HTMLElement> & { asChild?: boolean }> = ({
  children,
}) => {
  const { setOpen } = useDialogContext();
  const child = React.Children.only(children) as React.ReactElement;
  return React.cloneElement(child, {
    onClick: (event: React.MouseEvent) => {
      child.props.onClick?.(event);
      setOpen(true);
    },
  });
};

export const DialogContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  children,
}) => {
  const { open, setOpen } = useDialogContext();

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('keydown', handleKey);
    }
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, setOpen]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />
      <div className={`relative z-10 w-full rounded-3xl p-6 text-foreground shadow-2xl ${className}`.trim()}>
        {children}
      </div>
    </div>,
    document.body,
  );
};

export const DialogHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', ...props }) => (
  <div className={`mb-4 ${className}`.trim()} {...props} />
);

export const DialogTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ className = '', ...props }) => (
  <h3 className={`text-2xl font-semibold ${className}`.trim()} {...props} />
);

export const DialogDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  className = '',
  ...props
}) => <p className={`text-sm text-muted-foreground ${className}`.trim()} {...props} />;

export const DialogFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', ...props }) => (
  <div className={`mt-6 flex justify-end gap-3 ${className}`.trim()} {...props} />
);
