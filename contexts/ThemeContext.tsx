import React from 'react';
import { Theme } from '../types';

export interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const ThemeContext = React.createContext<ThemeContextValue>({
  theme: 'light',
  setTheme: () => {},
});
