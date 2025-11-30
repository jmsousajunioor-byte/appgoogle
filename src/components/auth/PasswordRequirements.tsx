import React, { useMemo } from 'react';

interface PasswordRequirementsProps {
    password: string;
}

export const PasswordRequirements: React.FC<PasswordRequirementsProps> = ({ password }) => {
    const requirements = useMemo(() => [
        { label: 'Mínimo 8 caracteres', met: password.length >= 8 },
        { label: 'Letra maiúscula', met: /[A-Z]/.test(password) },
        { label: 'Letra minúscula', met: /[a-z]/.test(password) },
        { label: 'Número', met: /[0-9]/.test(password) },
        { label: 'Caractere especial', met: /[^A-Za-z0-9]/.test(password) },
    ], [password]);

    return (
        <div className="rounded-2xl border border-border/30 bg-white/5 p-4 space-y-2">
            <p className="text-xs font-medium text-foreground/80">Requisitos da senha:</p>
            {requirements.map((req) => (
                <div key={req.label} className="flex items-center gap-2 text-xs">
                    <div className={`h-2 w-2 rounded-full transition-colors ${req.met ? 'bg-emerald-500' : 'bg-muted/50'}`} />
                    <span className={req.met ? 'text-foreground' : 'text-muted-foreground'}>{req.label}</span>
                </div>
            ))}
        </div>
    );
};

export default PasswordRequirements;
