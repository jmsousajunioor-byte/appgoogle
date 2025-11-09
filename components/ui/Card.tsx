import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  actions?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ children, className = '', title, actions }) => {
  return (
    <div className={`bg-white dark:bg-neutral-900 p-6 rounded-2xl shadow-md ${className}`}>
      {(title || actions) && (
        <header className="flex justify-between items-center mb-4">
          {title && <h3 className="font-heading text-lg text-neutral-700 dark:text-neutral-200">{title}</h3>}
          {actions && <div className="flex items-center space-x-2">{actions}</div>}
        </header>
      )}
      <div>{children}</div>
    </div>
  );
};

export default Card;