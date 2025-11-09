import React, { useState, useRef } from 'react';
import { Card, CardBrand } from '../../types';

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
    // Reset mouse position to the center to prevent a jump on re-entry
    if (cardRef.current) {
        setMousePos({ x: cardRef.current.clientWidth / 2, y: cardRef.current.clientHeight / 2 });
    }
  };
  
  const rect = cardRef.current?.getBoundingClientRect();
  const normalizedX = (isHovered && rect && rect.width > 0) ? (mousePos.x / rect.width) - 0.5 : 0;
  const normalizedY = (isHovered && rect && rect.height > 0) ? (mousePos.y / rect.height) - 0.5 : 0;

  // 3D rotation for the card itself
  const rotateY = normalizedX * 25;
  const rotateX = -normalizedY * 25;
  
  // Parallax translation for the inner content
  const parallaxTranslateX = -normalizedX * 15;
  const parallaxTranslateY = -normalizedY * 15;

  const cardStyle = {
    background: `linear-gradient(135deg, ${card.gradient.start}, ${card.gradient.end})`,
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

  return (
    <div 
      ref={cardRef}
      className={`relative w-full aspect-[1.586] rounded-2xl text-white p-6 flex flex-col justify-between shadow-lg cursor-pointer`}
      style={cardStyle}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
    >
      <div className="absolute inset-0 rounded-2xl overflow-hidden" style={glareStyle}></div>
      
      {/* This wrapper holds all content and will have the parallax transform applied */}
      <div className="relative z-10 flex flex-col justify-between h-full" style={contentStyle}>
        <div className="flex justify-between items-start">
          <span className="font-bold">{card.nickname}</span>
          <img src={brandLogos[card.brand]} alt={card.brand} className="h-8 object-contain" />
        </div>

        <div>
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
    </div>
  );
};

export default RealisticCard;
