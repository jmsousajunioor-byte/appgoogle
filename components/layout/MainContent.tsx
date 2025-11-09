import React from 'react';
import Header from './Header';

interface MainContentProps {
  children: React.ReactNode;
  onMenuClick: () => void;
}

const MainContent: React.FC<MainContentProps> = ({ children, onMenuClick }) => {
  return (
    <div className="flex-1 flex flex-col h-screen w-full overflow-hidden">
        <Header onMenuClick={onMenuClick} />
        <main className="flex-1 overflow-y-auto bg-neutral-50 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100">
            {children}
        </main>
    </div>
  );
};

export default MainContent;
