import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'ocean' | 'sunset' | 'forest';

type ThemeContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  themes: Array<{ value: Theme; label: string; description: string }>;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const themes = [
  { value: 'light' as Theme, label: 'Light', description: 'Clean and bright' },
  { value: 'dark' as Theme, label: 'Dark', description: 'Easy on the eyes' },
  { value: 'ocean' as Theme, label: 'Ocean', description: 'Calm blues and teals' },
  { value: 'sunset' as Theme, label: 'Sunset', description: 'Warm oranges and pinks' },
  { value: 'forest' as Theme, label: 'Forest', description: 'Natural greens and earth tones' },
];

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Check localStorage first, then fall back to light theme
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme') as Theme;
      return saved && themes.find(t => t.value === saved) ? saved : 'light';
    }
    return 'light';
  });

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  useEffect(() => {
    const root = document.documentElement;
    
    // Remove all theme classes
    themes.forEach(t => root.classList.remove(t.value));
    
    // Add the current theme class (except for light which is default)
    if (theme !== 'light') {
      root.classList.add(theme);
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}