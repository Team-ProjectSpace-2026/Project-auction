import { createContext, useContext, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Always keep body in light mode
  if (typeof document !== 'undefined') {
    document.body.classList.remove('dark-mode');
  }

  useEffect(() => {
    document.body.classList.remove('dark-mode');
    localStorage.removeItem('theme');
  }, []);

  const toggleTheme = () => {};

  return (
    <ThemeContext.Provider value={{ theme: 'light', toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);