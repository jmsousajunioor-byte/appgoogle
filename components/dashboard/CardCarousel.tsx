import React, { useState, useEffect } from 'react';
import { Card } from '../../types';
import RealisticCard from '../cards/RealisticCard';
import { Icon } from '../ui/Icon';

interface CardCarouselProps {
  cards: Card[];
  onCardClick: (card: Card) => void;
}

const CardCarousel: React.FC<CardCarouselProps> = ({ cards, onCardClick }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const dragThreshold = 50; // Minimum distance for a swipe in pixels
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Reset index when screen size or card count changes in a way that affects layout
  useEffect(() => {
    setCurrentIndex(0);
  }, [isDesktop, cards.length]);


  if (!cards || cards.length === 0) {
    return (
      <div className="text-center py-10 text-neutral-500 dark:text-neutral-400">
        Nenhum cartão para exibir. Adicione um na página de cartões.
      </div>
    );
  }
  
  // On desktop, if there are 2 or fewer cards, display them statically without carousel functionality.
  if (isDesktop && cards.length <= 2) {
    return (
      <div className="flex justify-center gap-8 w-full max-w-4xl mx-auto">
        {cards.map(card => (
          <div key={card.id} className="w-full max-w-md">
            <RealisticCard card={card} onClick={() => onCardClick(card)} />
          </div>
        ))}
      </div>
    );
  }

  const itemsVisible = isDesktop ? 2 : 1;
  const maxIndex = Math.max(0, cards.length - itemsVisible);
  const stepPercentage = 100 / itemsVisible;

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : 0));
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex < maxIndex ? prevIndex + 1 : maxIndex));
  };

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    setStartX('touches' in e ? e.touches[0].clientX : e.clientX);
    setDragOffset(0);
    if ('preventDefault' in e && e.type !== 'touchstart') {
        e.preventDefault();
    }
  };

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    const currentX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const offset = currentX - startX;
    setDragOffset(offset);
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    // Check if swipe is significant enough to change card
    if (dragOffset > dragThreshold && currentIndex > 0) { // Swiped right
      handlePrev();
    } else if (dragOffset < -dragThreshold && currentIndex < maxIndex) { // Swiped left
      handleNext();
    }

    // Reset drag offset to trigger snap-back animation
    setDragOffset(0);
  };

  const handleClick = (card: Card) => {
    // A click is a drag of a very small distance.
    if (Math.abs(dragOffset) < 10) {
      onCardClick(card);
    }
  };

  // Apply dynamic styles for fluid dragging and snapping animation
  const sliderStyle = {
    transform: `translateX(calc(-${currentIndex * stepPercentage}% + ${dragOffset}px))`,
    transition: isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
  };

  const cardWidthClass = isDesktop ? 'md:w-1/2' : 'w-full';

  return (
    <div
      className="relative group w-full max-w-md md:max-w-4xl mx-auto cursor-grab active:cursor-grabbing"
      onMouseDown={handleDragStart}
      onMouseMove={handleDragMove}
      onMouseUp={handleDragEnd}
      onMouseLeave={handleDragEnd}
      onTouchStart={handleDragStart}
      onTouchMove={handleDragMove}
      onTouchEnd={handleDragEnd}
    >
      <div className="overflow-hidden">
        <div
          className="flex"
          style={sliderStyle}
        >
          {cards.map((card) => (
            <div
              key={card.id}
              className={`${cardWidthClass} flex-shrink-0 px-2 select-none`}
              // Prevent native image dragging
              onDragStart={(e) => e.preventDefault()}
            >
              <RealisticCard card={card} onClick={() => handleClick(card)} />
            </div>
          ))}
        </div>
      </div>

      {cards.length > itemsVisible && (
        <>
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="absolute top-1/2 -translate-y-1/2 left-0 z-10 w-10 h-10 flex items-center justify-center bg-white/50 dark:bg-black/30 backdrop-blur-sm rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 hover:bg-white/75 disabled:opacity-20 disabled:cursor-not-allowed"
            aria-label="Cartão anterior"
          >
            <Icon icon="chevron-left" className="h-6 w-6 text-neutral-800 dark:text-white" />
          </button>

          <button
            onClick={handleNext}
            disabled={currentIndex === maxIndex}
            className="absolute top-1/2 -translate-y-1/2 right-0 z-10 w-10 h-10 flex items-center justify-center bg-white/50 dark:bg-black/30 backdrop-blur-sm rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 hover:bg-white/75 disabled:opacity-20 disabled:cursor-not-allowed"
            aria-label="Próximo cartão"
          >
            <Icon icon="chevron-right" className="h-6 w-6 text-neutral-800 dark:text-white" />
          </button>
        </>
      )}
    </div>
  );
};

export default CardCarousel;
