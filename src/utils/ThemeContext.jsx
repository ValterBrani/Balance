import { createContext, useContext, useState, useEffect } from 'react';

const DARK = {
  bg: '#07090f',
  surface: '#0d1120',
  card: '#121828',
  border: 'rgba(255,255,255,0.07)',
  borderMid: 'rgba(255,255,255,0.13)',
  accent: '#c8962a',
  accentL: '#e6b94a',
  accentBg: 'rgba(200,150,42,0.1)',
  text: '#dde4f5',
  textSec: '#6d7d96',
  textMut: '#2d3a4d',
  inc: '#3ecf8e',
  exp: '#f56565',
};

const LIGHT = {
  bg: '#f4f5f7',
  surface: '#ffffff',
  card: '#ffffff',
  border: 'rgba(0,0,0,0.08)',
  borderMid: 'rgba(0,0,0,0.14)',
  accent: '#c8962a',
  accentL: '#b8860b',
  accentBg: 'rgba(200,150,42,0.08)',
  text: '#1a1a2e',
  textSec: '#6b7280',
  textMut: '#d1d5db',
  inc: '#16a34a',
  exp: '#dc2626',
};

const ThemeContext = createContext({ C: DARK, theme: 'dark', toggle: () => {} });

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('balance-theme') || 'dark');

  useEffect(() => { localStorage.setItem('balance-theme', theme); }, [theme]);

  const toggle = () => setTheme((t) => t === 'dark' ? 'light' : 'dark');
  const C = theme === 'dark' ? DARK : LIGHT;

  return (
    <ThemeContext.Provider value={{ C, theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
export const useColors = () => useContext(ThemeContext).C;
