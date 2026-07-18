import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

type Theme = 'dark' | 'light';
type ThemeCtx = { theme: Theme; toggle: () => void; setTheme: (t: Theme) => void };
const ThemeContext = createContext<ThemeCtx>({ theme: 'dark', toggle: () => {}, setTheme: () => {} });
const KEY = 'socialhub_theme';

function getInitial(): Theme {
  try {
    const s = localStorage.getItem(KEY);
    if (s === 'light' || s === 'dark') return s;
  } catch { /* ignore */ }
  return 'dark';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getInitial);
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    try { localStorage.setItem(KEY, theme); } catch { /* ignore */ }
  }, [theme]);
  const toggle = () => setThemeState((t) => (t === 'dark' ? 'light' : 'dark'));
  const setTheme = (t: Theme) => setThemeState(t);
  return <ThemeContext.Provider value={{ theme, toggle, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() { return useContext(ThemeContext); }
