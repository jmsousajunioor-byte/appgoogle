import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  icon: 'credit-card' | 'calendar' | 'bar-chart' | 'pie-chart' | 'cog' | 'user' | 'transactions' | 'bank' | 'budget' | 'dashboard' | 'logout' | 'plus' | 'close' | 'chevron-down' | 'check' | 'copy' | 'arrow-up-right' | 'arrow-down-right' | 'trending-up' | 'trending-down' | 'dots-horizontal';
}

const ICONS: Record<IconProps['icon'], React.ReactNode> = {
  'credit-card': <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />,
  calendar: <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0h18M-7.5 14.25h.008v.008H-7.5v-.008z" />,
  'bar-chart': <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />,
  'pie-chart': <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />,
  cog: <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-1.003 1.11-1.226M15 21v-2.032a2.25 2.25 0 00-1.21-2.032M15 21a2.25 2.25 0 00-2.25-2.25H7.5A2.25 2.25 0 005.25 21M15 21a2.25 2.25 0 01-2.25-2.25M7.5 18.75a2.25 2.25 0 01-2.25-2.25V6.108c0-1.135.845-2.098 1.976-2.192l4.162-.392a2.25 2.25 0 012.358 2.358l.392 4.162c.094 1.131-.857 2.098-1.99 2.192H6.375a2.25 2.25 0 00-2.25 2.25M9.594 3.94A2.25 2.25 0 0112 6.19l.392 4.162a2.25 2.25 0 01-2.358 2.358l-4.162-.392a2.25 2.25 0 01-2.192-1.976V6.108a2.25 2.25 0 012.25-2.25h.534z" />,
  user: <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />,
  transactions: <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />,
  bank: <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />,
  budget: <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 3a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 12m15 6.75h-6m6 0a2.25 2.25 0 01-2.25-2.25v-2.25a2.25 2.25 0 012.25-2.25h.008v.008h-.008v-.008z" />,
  dashboard: <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 8.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 018.25 20.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6A2.25 2.25 0 0115.75 3.75h2.25A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25A2.25 2.25 0 0113.5 8.25V6zM13.5 15.75A2.25 2.25 0 0115.75 13.5h2.25a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />,
  logout: <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />,
  plus: <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />,
  close: <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />,
  'chevron-down': <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />,
  check: <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />,
  copy: <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5-.124m7.5 10.375a3 3 0 11-6 0 3 3 0 016 0z" />,
  'arrow-up-right': <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />,
  'arrow-down-right': <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 4.5l15 15m0 0V8.25m0 11.25H8.25" />,
  'trending-up': <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-3.291 3.291m3.291-3.291L19.5 3" />,
  'trending-down': <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6L9 12.75l4.286-4.286a11.948 11.948 0 014.306 6.43l.776 2.898m0 0l3.182-5.511m-3.182 5.51l-5.511-3.181" />,
  'dots-horizontal': <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />,
};

export const Icon: React.FC<IconProps> = ({ icon, className = 'h-6 w-6', ...props }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} {...props}>
      {ICONS[icon]}
    </svg>
  );
};
