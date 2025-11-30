import React, { useState, useRef } from 'react';
import { Card, CardBrand } from '../../types';

import visaLogo from '../../assets/brands/visa.png';
import visaSignatureLogo from '../../assets/brands/visa-signature.png';
import mastercardLogo from '../../assets/brands/mastercard.png';
import amexLogo from '../../assets/brands/amex.png';
import eloLogo from '../../assets/brands/elo.png';
import hipercardLogo from '../../assets/brands/hipercard.png';

interface RealisticCardProps {
  card: Partial<Card>;
  onClick?: () => void;
}

const brandLogos: Record<CardBrand, string> = {
  [CardBrand.Visa]: visaLogo,
  [CardBrand.VisaSignature]: visaSignatureLogo,
  [CardBrand.Mastercard]: mastercardLogo,
  [CardBrand.Amex]: amexLogo,
  [CardBrand.Elo]: eloLogo,
  [CardBrand.Hipercard]: hipercardLogo,
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
    <>
    <style>{`
      .card-realistic {
        border-radius: 16px !important;
        overflow: hidden !important;
      }
      .card-realistic > div {
        border-radius: 16px !important;
      }
    `}</style>
    <div 
      ref={cardRef}
      className={`card-realistic relative w-full aspect-[1.586] text-white p-3 sm:p-4 md:p-5 lg:p-6 flex flex-col justify-between ${onClick ? 'cursor-pointer' : ''}`}
      style={{
        ...cardStyle,
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.06), inset 0 0 0 1.5px rgba(255, 255, 255, 0.15), inset 0 0 20px rgba(255, 255, 255, 0.05)'
      }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
    >
      <div 
        className="absolute inset-0 rounded-2xl" 
        style={{
          ...glareStyle,
          boxShadow: 'inset 0 0 0 1.5px rgba(255, 255, 255, 0.15), inset 0 0 20px rgba(255, 255, 255, 0.05)'
        }}
      ></div>
      
      <div className="relative z-10 flex flex-col justify-between h-full" style={contentStyle}>
        <div className="flex justify-between items-start gap-2">
          <span className="font-bold text-xs sm:text-sm md:text-base truncate max-w-[60%]">{nickname || 'Apelido do Cartão'}</span>
          {brand && (
            <img
              src={brandLogos[brand]}
              alt={brand}
              className="h-6 sm:h-7 md:h-8 lg:h-10 max-w-[60px] sm:max-w-[70px] md:max-w-[80px] lg:max-w-[100px] object-contain flex-shrink-0"
              style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5)) brightness(1.1)' }}
            />
          )}
        </div>

        <div>
          <div className="font-mono text-sm sm:text-base md:text-lg lg:text-2xl tracking-wider sm:tracking-widest mb-2 sm:mb-3 md:mb-4">
            •••• •••• •••• {last4}
          </div>
          <div className="flex justify-between items-end text-[10px] sm:text-xs md:text-sm gap-2">
            <div className="min-w-0 flex-1">
              <span className="opacity-70 block text-[8px] sm:text-[10px] md:text-xs">Titular</span>
              <span className="font-medium tracking-wide sm:tracking-wider truncate block">{holderName}</span>
            </div>
            <div className="flex-shrink-0 text-right">
              <span className="opacity-70 block text-[8px] sm:text-[10px] md:text-xs">Validade</span>
              <span className="font-medium tracking-wide sm:tracking-wider">{expiration}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

// Expose static method to be used in other components
RealisticCard.getBrandLogo = (brand: CardBrand) => brandLogos[brand];

export default RealisticCard;
