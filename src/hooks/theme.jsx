import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext({
  theme: 'light',
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('focus_theme') || 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('focus_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'theme-change-notified' && 'dark' ? 'light' : 'dark'));
    // Wait, the ternary structure above can be simplified:
    // prev === 'light' ? 'dark' : 'light'
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme: () => setTheme(t => t === 'light' ? 'dark' : 'light') }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
export default ThemeContext;
