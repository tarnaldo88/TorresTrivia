import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Theme, ThemeSettings, ThemeMode } from '../types/theme';
import { ThemeService } from '../services/themeService';

interface ThemeContextType {
  currentTheme: Theme;
  allThemes: Theme[];
  settings: ThemeSettings;
  mode: ThemeMode;
  setTheme: (themeId: string) => void;
  setMode: (mode: ThemeMode) => void;
  createCustomTheme: (theme: Omit<Theme, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateCustomTheme: (themeId: string, updates: Partial<Theme>) => Promise<void>;
  deleteCustomTheme: (themeId: string) => Promise<void>;
  exportTheme: (themeId: string) => Promise<string>;
  importTheme: (themeJson: string) => Promise<string>;
  resetToDefault: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<Theme | null>(null);
  const [allThemes, setAllThemes] = useState<Theme[]>([]);
  const [settings, setSettings] = useState<ThemeSettings | null>(null);
  const [mode, setModeState] = useState<ThemeMode>('auto');
  const [themeService] = useState(() => new ThemeService());

  useEffect(() => {
    initializeTheme();
  }, []);

  const initializeTheme = async () => {
    try {
      const [loadedSettings, loadedThemes] = await Promise.all([
        themeService.getSettings(),
        themeService.getAllThemes()
      ]);

      setSettings(loadedSettings);
      setAllThemes(loadedThemes);
      setModeState(loadedSettings.mode);

      // Determine current theme based on mode
      const themeId = getThemeForMode(loadedSettings.mode, loadedSettings.currentThemeId);
      const theme = loadedThemes.find((t: Theme) => t.id === themeId) || loadedThemes[0];
      
      if (theme) {
        setCurrentTheme(theme);
      }
    } catch (error) {
      console.error('Failed to initialize theme:', error);
    }
  };

  const getThemeForMode = (themeMode: ThemeMode, currentThemeId: string): string => {
    switch (themeMode) {
      case 'light':
        return 'light-default';
      case 'dark':
        return 'dark-default';
      case 'auto':
      default:
        return currentThemeId;
    }
  };

  const setTheme = async (themeId: string) => {
    try {
      const theme = allThemes.find((t: Theme) => t.id === themeId);
      if (!theme) {
        throw new Error(`Theme ${themeId} not found`);
      }

      setCurrentTheme(theme);
      
      if (settings) {
        const newSettings = { ...settings, currentThemeId: themeId };
        await themeService.saveSettings(newSettings);
        setSettings(newSettings);
      }
    } catch (error) {
      console.error('Failed to set theme:', error);
    }
  };

  const setMode = async (newMode: ThemeMode) => {
    try {
      setModeState(newMode);
      
      if (settings) {
        const newSettings = { ...settings, mode: newMode };
        await themeService.saveSettings(newSettings);
        setSettings(newSettings);
      }

      // Update current theme based on new mode
      const themeId = getThemeForMode(newMode, settings?.currentThemeId || 'default');
      await setTheme(themeId);
    } catch (error) {
      console.error('Failed to set theme mode:', error);
    }
  };

  const createCustomTheme = async (themeData: Omit<Theme, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    try {
      const themeId = await themeService.createCustomTheme(themeData);
      
      // Reload themes
      const updatedThemes = await themeService.getAllThemes();
      setAllThemes(updatedThemes);
      
      return themeId;
    } catch (error) {
      console.error('Failed to create custom theme:', error);
      throw error;
    }
  };

  const updateCustomTheme = async (themeId: string, updates: Partial<Theme>): Promise<void> => {
    try {
      await themeService.updateCustomTheme(themeId, updates);
      
      // Reload themes
      const updatedThemes = await themeService.getAllThemes();
      setAllThemes(updatedThemes);
      
      // Update current theme if it's the one being updated
      if (currentTheme && currentTheme.id === themeId) {
        const updatedTheme = updatedThemes.find((t: Theme) => t.id === themeId);
        if (updatedTheme) {
          setCurrentTheme(updatedTheme);
        }
      }
    } catch (error) {
      console.error('Failed to update custom theme:', error);
      throw error;
    }
  };

  const deleteCustomTheme = async (themeId: string): Promise<void> => {
    try {
      await themeService.deleteCustomTheme(themeId);
      
      // Reload themes
      const updatedThemes = await themeService.getAllThemes();
      setAllThemes(updatedThemes);
      
      // Switch to default theme if current theme was deleted
      if (currentTheme && currentTheme.id === themeId) {
        await setTheme('default');
      }
    } catch (error) {
      console.error('Failed to delete custom theme:', error);
      throw error;
    }
  };

  const exportTheme = async (themeId: string): Promise<string> => {
    try {
      return await themeService.exportTheme(themeId);
    } catch (error) {
      console.error('Failed to export theme:', error);
      throw error;
    }
  };

  const importTheme = async (themeJson: string): Promise<string> => {
    try {
      const themeId = await themeService.importTheme(themeJson);
      
      // Reload themes
      const updatedThemes = await themeService.getAllThemes();
      setAllThemes(updatedThemes);
      
      return themeId;
    } catch (error) {
      console.error('Failed to import theme:', error);
      throw error;
    }
  };

  const resetToDefault = async (): Promise<void> => {
    try {
      await themeService.resetToDefault();
      await initializeTheme();
    } catch (error) {
      console.error('Failed to reset to default theme:', error);
      throw error;
    }
  };

  if (!currentTheme || !settings) {
    return null; // Loading state
  }

  const value: ThemeContextType = {
    currentTheme,
    allThemes,
    settings,
    mode,
    setTheme,
    setMode,
    createCustomTheme,
    updateCustomTheme,
    deleteCustomTheme,
    exportTheme,
    importTheme,
    resetToDefault,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Helper hook for accessing theme values directly
export const useThemeValues = () => {
  const { currentTheme } = useTheme();
  return currentTheme;
};
