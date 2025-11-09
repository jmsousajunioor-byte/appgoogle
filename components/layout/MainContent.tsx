import React from 'react';

const MainContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <main className="flex-1 h-screen overflow-y-auto bg-neutral-50 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100">
      {children}
    </main>
  );
};

export default MainContent;