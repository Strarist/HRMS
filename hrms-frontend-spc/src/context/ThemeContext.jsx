import React, { createContext, useContext, useEffect, useState } from 'react';
import { applyTheme, getTheme } from '../config/themes';
import { updateThemePreference } from '../api/user';
import toast from '../utils/toast';

const ThemeContext = createContext({ 
  theme: 'dark', 
  themeConfig: null,
  setTheme: () => {},
  toggleTheme: () => {},
  isChanging: false
});

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved || 'dark';
  });
  const [isChanging, setIsChanging] = useState(false);

  // Apply theme on mount and when theme changes
  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Set theme and sync with backend
  const setTheme = async (newTheme, skipSync = false) => {
    // Allow re-applying custom theme to update colors
    if (newTheme === theme && newTheme !== 'custom') return;

    setIsChanging(true);
    
    // Force re-apply theme even if it's the same (for custom theme updates)
    applyTheme(newTheme);
    setThemeState(newTheme);

    // Sync with backend if user is authenticated
    if (!skipSync) {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          await updateThemePreference(newTheme);
          
          // Update user in localStorage
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            const user = JSON.parse(storedUser);
            user.themePreference = newTheme;
            localStorage.setItem('user', JSON.stringify(user));
          }
        }
      } catch (error) {
        console.error('Failed to sync theme preference:', error);
        // Don't show error toast, theme still works locally
      }
    }

    setTimeout(() => setIsChanging(false), 300);
  };

  // Toggle between light and dark (legacy support)
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  };

  // Get current theme configuration
  const themeConfig = getTheme(theme);

  const value = {
    theme,
    themeConfig,
    setTheme,
    toggleTheme,
    isChanging
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
