import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { CardBrand, NewCard, Card, Gradient } from '../../types';
import RealisticCard from './RealisticCard';
import Input from '../ui/Input';
import { cardThemes } from '../../utils/cardThemes';
import { Icon } from '../ui/Icon';

interface AddCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCard?: (newCard: NewCard) => void;
  onUpdateCard?: (card: Card) => void;
  initialCard?: Card | null;
}

const brandOptions: CardBrand[] = [CardBrand.Visa, CardBrand.VisaSignature, CardBrand.Mastercard, CardBrand.Elo, CardBrand.Amex, CardBrand.Hipercard];

const AddCardModal: React.FC<AddCardModalProps> = ({ isOpen, onClose, onAddCard, onUpdateCard, initialCard }) => {
  const [step, setStep] = useState(1);
  const [cardData, setCardData] = useState<Omit<Card, 'id'>>({
    nickname: '',
    brand: CardBrand.Mastercard,
    last4: '••••',
    holderName: 'NOME COMPLETO',
    expiration: 'MM/AA',
    limit: 0,
    dueDateDay: 1,
    closingDay: 1,
    // Inicia em cinza, usuário escolhe a cor depois
    gradient: { start: '#CCCCCC', end: '#666666' },
  });

  const isEditMode = !!initialCard && !!onUpdateCard;

  React.useEffect(() => {
    if (isOpen) {
      if (initialCard) {
        const { id, ...rest } = initialCard;
        setCardData(rest);
        setStep(1);
      } else {
        // se não for edição, garante reset base cinza
        setCardData({
          nickname: '',
          brand: CardBrand.Mastercard,
          last4: '••••',
          holderName: 'NOME COMPLETO',
          expiration: 'MM/AA',
          limit: 0,
          dueDateDay: 1,
          closingDay: 1,
          gradient: { start: '#CCCCCC', end: '#666666' },
        });
        setStep(1);
      }
    }
  }, [isOpen, initialCard]);

  const handleDataChange = (newData: Partial<Omit<Card, 'id'>>) => {
    setCardData(prev => ({ ...prev, ...newData }));
  };

  const resetState = () => {
    setStep(1);
    setCardData({
      nickname: '',
      brand: CardBrand.Mastercard,
      last4: '••••',
      holderName: 'NOME COMPLETO',
      expiration: 'MM/AA',
      limit: 0,
      dueDateDay: 1,
      closingDay: 1,
      // Reseta para o cinza padrão
      gradient: { start: '#CCCCCC', end: '#666666' },
    });
  }

  const handleClose = () => {
      resetState();
      onClose();
  }

  const handleSubmit = () => {
    if (isEditMode && initialCard && onUpdateCard) {
      onUpdateCard({ ...cardData, id: initialCard.id });
    } else if (onAddCard) {
      onAddCard(cardData);
    }
    handleClose();
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <Input
            label="4 Últimos Dígitos do Cartão"
            name="last4"
            value={cardData.last4 === '••••' ? '' : cardData.last4}
            onChange={(e) => handleDataChange({ last4: e.target.value.replace(/\D/g, '') || '••••' })}
            maxLength={4}
            placeholder="1234"
            autoFocus
          />
        );
      case 2:
        return (
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Bandeira</label>
            <div className="grid grid-cols-3 gap-2">
              {brandOptions.map((brand) => {
                const isSelected = cardData.brand === brand;

                return (
                  <button
                    key={brand}
                    type="button"
                    onClick={() => handleDataChange({ brand })}
                    className={`p-3 h-24 flex flex-col items-center justify-center gap-2 rounded-lg border-2 transition-all text-center ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/50'
                        : 'border-neutral-300 dark:border-neutral-600 hover:border-indigo-400'
                    }`}
                  >
                    <img src={RealisticCard.getBrandLogo(brand)} alt={brand} className="h-8 object-contain" />
                    <span
                      className={`text-xs font-medium ${isSelected ? 'text-indigo-700 dark:text-indigo-100' : 'text-neutral-600 dark:text-neutral-200'}`}
                    >
                      {brand}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      case 3:
        return (
            <Input
                label="Nome no Cartão"
                name="holderName"
                value={cardData.holderName === 'NOME COMPLETO' ? '' : cardData.holderName}
                onChange={(e) => handleDataChange({ holderName: e.target.value.toUpperCase() || 'NOME COMPLETO' })}
                placeholder="JOAO DA SILVA"
                autoFocus
            />
        );
      case 4:
        return (
          <div className="space-y-4">
            <Input
              label="Validade (MM/AA)"
              name="expiration"
              value={cardData.expiration === 'MM/AA' ? '' : cardData.expiration}
              onChange={(e) => {
                  let value = e.target.value.replace(/\D/g, '');
                  if (value.length > 2) {
                    value = value.slice(0, 2) + '/' + value.slice(2,4);
                  }
                  handleDataChange({ expiration: value || 'MM/AA' })
              }}
              placeholder="12/28"
              maxLength={5}
            />
            <Input label="Limite de Crédito" name="limit" type="number" step="0.01" placeholder="5000,00" onChange={(e) => handleDataChange({ limit: parseFloat(e.target.value) || 0 })}/>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Dia de Fechamento" name="closingDay" type="number" min="1" max="31" placeholder="3" onChange={(e) => handleDataChange({ closingDay: parseInt(e.target.value, 10) || 1 })}/>
              <Input label="Dia de Vencimento" name="dueDateDay" type="number" min="1" max="31" placeholder="10" onChange={(e) => handleDataChange({ dueDateDay: parseInt(e.target.value, 10) || 1 })}/>
            </div>
          </div>
        );
      case 5:
        return (
            <Input
                label="Apelido do Cartão"
                name="nickname"
                value={cardData.nickname}
                onChange={(e) => handleDataChange({ nickname: e.target.value })}
                placeholder="Ex: Cartão Pessoal"
                autoFocus
            />
        );
       case 6:
        return (
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Tema do Cartão</label>
            <div className="grid grid-cols-3 gap-3 mb-4">
               {cardThemes.map(theme => (
                  <div key={theme.name} className="text-center">
                      <button
                          type="button"
                          onClick={() => handleDataChange({ gradient: theme.gradient })}
                          className={`w-full h-12 rounded-lg border-2 transition-all ${
                              JSON.stringify(cardData.gradient) === JSON.stringify(theme.gradient) ? 'border-indigo-500 ring-2 ring-indigo-500' : 'border-transparent hover:border-neutral-400'
                          }`}
                          style={{ background: `linear-gradient(45deg, ${theme.gradient.start}, ${theme.gradient.end})` }}
                          aria-label={theme.name}
                      />
                      <span className="text-xs mt-1 text-neutral-600 dark:text-neutral-400 block truncate">{theme.name}</span>
                  </div>
              ))}
            </div>
             <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 mt-4">Cores Customizadas</label>
            <div className="flex gap-4">
                <Input label="Início" type="color" name="gradientStart" value={cardData.gradient.start} onChange={(e) => handleDataChange({ gradient: { ...cardData.gradient, start: e.target.value } })} className="p-1 h-10" />
                <Input label="Fim" type="color" name="gradientEnd" value={cardData.gradient.end} onChange={(e) => handleDataChange({ gradient: { ...cardData.gradient, end: e.target.value } })} className="p-1 h-10"/>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const progress = (step / 6) * 100;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={isEditMode ? "Editar Cartão" : "Adicionar Novo Cartão"} size="3xl">
      <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
        <div className="w-full max-w-sm mx-auto">
          <RealisticCard card={cardData as Card} />
        </div>
        <div className="flex flex-col">
            <div className="mb-6">
                <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                    <div className="bg-indigo-600 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                </div>
            </div>
          
            <div className="min-h-[180px]">
                {renderStepContent()}
            </div>
          
            <div className="flex justify-between items-center mt-6">
                <Button variant="secondary" onClick={() => setStep(s => s - 1)} disabled={step === 1}>
                    <Icon icon="chevron-left" className="h-5 w-5 mr-2" />
                    Voltar
                </Button>
                {step < 6 ? (
                    <Button onClick={() => setStep(s => s + 1)}>
                        Avançar
                        <Icon icon="chevron-right" className="h-5 w-5 ml-2" />
                    </Button>
                ) : (
                    <Button onClick={handleSubmit} leftIcon="check">
                        {isEditMode ? 'Salvar Alterações' : 'Adicionar Cartão'}
                    </Button>
                )}
            </div>
        </div>
      </div>
    </Modal>
  );
};

export default AddCardModal;
