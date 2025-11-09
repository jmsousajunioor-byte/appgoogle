import React from 'react';
import { Card } from '../../types';
import RealisticCard from '../cards/RealisticCard';

interface CardCarouselProps {
  cards: Card[];
}

const CardCarousel: React.FC<CardCarouselProps> = ({ cards }) => {
  return (
    <div className="flex space-x-8 pb-4 overflow-x-auto">
      {cards.map(card => (
        <div key={card.id} className="flex-shrink-0 w-80">
          <RealisticCard card={card} />
        </div>
      ))}
    </div>
  );
};

export default CardCarousel;
