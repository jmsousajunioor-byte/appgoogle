import React, { useState, useRef } from 'react';
import { Card, CardBrand } from '../../types';

interface RealisticCardProps {
  card: Partial<Card>;
  onClick?: () => void;
}

const brandLogos: Record<CardBrand, string> = {
  [CardBrand.Visa]: 'https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg',
  [CardBrand.VisaSignature]: 'https://usa.visa.com/dam/VCOM/regional/na/us/pay-with-visa/img/visa-signature-logo.png',
  [CardBrand.Mastercard]: 'https://upload.wikimedia.org/wikipedia/commons/a/a4/Mastercard_2019_logo.svg',
  [CardBrand.Amex]: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/American_Express_logo_%282018%29.svg/1200px-American_Express_logo_%282018%29.svg.png',
  [CardBrand.Elo]: 'https://upload.wikimedia.org/wikipedia/commons/5/54/Elo_cart%C3%A3o_logo.svg',
  [CardBrand.Hipercard]: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Hipercard_logo.svg/1280px-Hipercard_logo.svg.png',
};

const defaultGradient = { start: '#CCCCCC', end: '#666666' };

const RealisticCard: React.FC<RealisticCardProps> = ({ card, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (cardRef.current) {
        setMousePos({ x: cardRef.current.clientWidth / 2, y: cardRef.current.clientHeight / 2 });
    }
  };
  
  const rect = cardRef.current?.getBoundingClientRect();
  const normalizedX = (isHovered && rect && rect.width > 0) ? (mousePos.x / rect.width) - 0.5 : 0;
  const normalizedY = (isHovered && rect && rect.height > 0) ? (mousePos.y / rect.height) - 0.5 : 0;

  const rotateY = normalizedX * 25;
  const rotateX = -normalizedY * 25;
  
  const parallaxTranslateX = -normalizedX * 15;
  const parallaxTranslateY = -normalizedY * 15;
  
  const gradient = card.gradient || defaultGradient;

  const cardStyle = {
    background: `linear-gradient(135deg, ${gradient.start}, ${gradient.end})`,
    transform: `perspective(1000px) rotateY(${rotateY}deg) rotateX(${rotateX}deg) scale3d(${isHovered ? 1.05 : 1}, ${isHovered ? 1.05 : 1}, ${isHovered ? 1.05 : 1})`,
    transition: 'transform 0.1s ease-out',
  };

  const glareStyle = {
    background: `radial-gradient(circle at ${mousePos.x}px ${mousePos.y}px, rgba(255, 255, 255, 0.2), transparent 50%)`,
    transition: 'opacity 0.2s ease-out',
    opacity: isHovered ? 1 : 0,
  };

  const contentStyle = {
      transform: `translate3d(${parallaxTranslateX}px, ${parallaxTranslateY}px, 0)`,
      transition: 'transform 0.1s ease-out',
  };

  const {
      nickname = 'Apelido do Cartão',
      brand = CardBrand.Mastercard,
      last4 = '••••',
      holderName = 'NOME COMPLETO',
      expiration = 'MM/AA'
  } = card;

  return (
    <div 
      ref={cardRef}
      className={`relative w-full aspect-[1.586] rounded-2xl text-white p-6 flex flex-col justify-between shadow-lg ${onClick ? 'cursor-pointer' : ''}`}
      style={cardStyle}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
    >
      <div className="absolute inset-0 rounded-2xl overflow-hidden" style={glareStyle}></div>
      
      <div className="relative z-10 flex flex-col justify-between h-full" style={contentStyle}>
        <div className="flex justify-between items-start">
          <span className="font-bold">{nickname || 'Apelido do Cartão'}</span>
          {brand && <img src={brandLogos[brand]} alt={brand} className="h-8 object-contain" style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5)) brightness(1.1)' }} />}
        </div>

        <div>
          <div className="font-mono text-2xl tracking-widest mb-4">
            •••• •••• •••• {last4}
          </div>
          <div className="flex justify-between items-end text-sm">
            <div>
              <span className="opacity-70 block text-xs">Card Holder</span>
              <span className="font-medium tracking-wider">{holderName}</span>
            </div>
            <div>
              <span className="opacity-70 block text-xs">Expires</span>
              <span className="font-medium tracking-wider">{expiration}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Expose static method to be used in other components
RealisticCard.getBrandLogo = (brand: CardBrand) => brandLogos[brand];

export default RealisticCard;