import React, { useState, useEffect } from 'react';
import Input from '../../ui/Input';
import Button from '../../ui/Button';
import Card from '../../ui/Card';

interface CardSettingsTabProps {
    cardId: string;
    currentThreshold?: number;
    onUpdate: (cardId: string, threshold: number) => void;
}

const CardSettingsTab: React.FC<CardSettingsTabProps> = ({ cardId, currentThreshold, onUpdate }) => {
    const [threshold, setThreshold] = useState(currentThreshold || 80);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        setThreshold(currentThreshold || 80);
    }, [currentThreshold]);

    const handleSave = () => {
        onUpdate(cardId, threshold);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-heading text-neutral-800 dark:text-neutral-100">Configurações e Alertas</h2>
            <Card>
                <h3 className="text-lg font-bold mb-2">Alerta de Limite Utilizado</h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
                    Receba um alerta quando o valor da sua fatura atual atingir uma certa porcentagem do seu limite total.
                </p>
                <div className="flex items-center space-x-4">
                    <div className="flex-1">
                        <Input
                            label="Alertar em (% do limite)"
                            type="number"
                            value={threshold}
                            onChange={(e) => setThreshold(Number(e.target.value))}
                            min="1"
                            max="100"
                        />
                    </div>
                    <Button onClick={handleSave} className="self-end" leftIcon={saved ? 'check' : undefined}>
                        {saved ? 'Salvo!' : 'Salvar'}
                    </Button>
                </div>
            </Card>
        </div>
    );
};

export default CardSettingsTab;
