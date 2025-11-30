import React, { useMemo } from 'react';

interface PasswordStrengthIndicatorProps {
    password: string;
}

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({ password }) => {
    const strength = useMemo(() => {
        let score = 0;
        if (password.length >= 8) score += 25;
        if (/[A-Z]/.test(password)) score += 25;
        if (/[a-z]/.test(password)) score += 25;
        if (/[0-9]/.test(password)) score += 12.5;
        if (/[^A-Za-z0-9]/.test(password)) score += 12.5;
        return Math.min(score, 100);
    }, [password]);

    const getStrengthText = () => {
        if (strength < 25) return 'Muito fraca';
        if (strength < 50) return 'Fraca';
        if (strength < 75) return 'Média';
        return 'Forte';
    };

    const getStrengthColor = () => {
        if (strength < 25) return 'bg-red-500';
        if (strength < 50) return 'bg-amber-500';
        if (strength < 75) return 'bg-yellow-500';
        return 'bg-emerald-500';
    };

    if (!password) return null;

    return (
        <div className="space-y-1">
            <div className="h-1.5 rounded-full bg-muted/30 overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-300 ${getStrengthColor()}`}
                    style={{ width: `${strength}%` }}
                />
            </div>
            <p className="text-xs text-muted-foreground">{getStrengthText()}</p>
        </div>
    );
};

export default PasswordStrengthIndicator;
