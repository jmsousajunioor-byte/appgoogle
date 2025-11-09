
import React, { useState } from 'react';
import { Card, CardBrand } from '../../types';
import { Icon } from '../ui/Icon';

interface RealisticCardProps {
  card: Card;
  onClick?: () => void;
}

const brandLogos: Record<CardBrand, string> = {
  [CardBrand.Visa]: 'https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg',
  [CardBrand.Mastercard]: 'https://upload.wikimedia.org/wikipedia/commons/a/a4/Mastercard_2019_logo.svg',
  [CardBrand.Amex]: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/American_Express_logo_%282018%29.svg',
  [CardBrand.Elo]: 'https://upload.wikimedia.org/wikipedia/commons/5/54/Elo_cart%C3%B5es_logo.svg',
};

const RealisticCard: React.FC<RealisticCardProps> = ({ card, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });
  };
  
  const cardStyle = {
    background: `linear-gradient(135deg, ${card.gradient.start}, ${card.gradient.end})`,
    transform: isHovered 
      ? `perspective(1000px) rotateY(${(mousePos.x / 350 - 0.5) * 15}deg) rotateX(${-(mousePos.y / 220 - 0.5) * 15}deg) scale3d(1.05, 1.05, 1.05)` 
      : 'perspective(1000px) rotateY(0deg) rotateX(0deg) scale3d(1, 1, 1)',
    transition: 'transform 0.2s ease-out',
  };

  const glareStyle = {
    background: `radial-gradient(circle at ${mousePos.x}px ${mousePos.y}px, rgba(255, 255, 255, 0.2), transparent 50%)`,
    transition: 'opacity 0.2s ease-out',
    opacity: isHovered ? 1 : 0,
  };

  return (
    <div 
      className={`relative w-full aspect-[1.586] rounded-2xl text-white p-6 flex flex-col justify-between shadow-lg cursor-pointer`}
      style={cardStyle}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
    >
      <div className="absolute inset-0 rounded-2xl overflow-hidden" style={glareStyle}></div>
      
      <div className="flex justify-between items-start z-10">
        <span className="font-bold">{card.nickname}</span>
        <img src={brandLogos[card.brand]} alt={card.brand} className="h-8 object-contain" />
      </div>

      <div className="z-10">
        <div className="font-mono text-2xl tracking-widest mb-4">
          •••• •••• •••• {card.last4}
        </div>
        <div className="flex justify-between items-end text-sm">
          <div>
            <span className="opacity-70 block text-xs">Card Holder</span>
            <span className="font-medium tracking-wider">{card.holderName.toUpperCase()}</span>
          </div>
          <div>
            <span className="opacity-70 block text-xs">Expires</span>
            <span className="font-medium tracking-wider">{card.expiration}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealisticCard;
