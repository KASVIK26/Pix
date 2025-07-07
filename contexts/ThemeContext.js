import React, { createContext, useContext, useState, useEffect } from 'react';
import { storageManager } from '../helpers/storage';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(true); // Changed to true for default dark theme
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const settings = await storageManager.getSettings();
      setIsDark(settings.darkMode !== undefined ? settings.darkMode : true); // Default to true (dark theme)
    } catch (error) {
      console.error('Error loading theme preference:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTheme = async () => {
    try {
      const newMode = !isDark;
      setIsDark(newMode);
      await storageManager.updateSettings({ darkMode: newMode });
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const value = {
    isDark,
    toggleTheme,
    isLoading,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
