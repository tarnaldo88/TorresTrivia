import { Theme, ThemeSettings, ThemeMode, ThemePreset } from '../types/theme';

/**
 * ThemeService handles theme persistence and management
 */
export class ThemeService {
  private readonly SETTINGS_KEY = 'torres_trivia_theme_settings';
  private readonly THEMES_KEY = 'torres_trivia_custom_themes';

  /**
   * Get theme settings from storage
   */
  async getSettings(): Promise<ThemeSettings> {
    try {
      // In a real app, this would use AsyncStorage or SecureStorage
      // For now, we'll return default settings
      const defaultSettings: ThemeSettings = {
        currentThemeId: 'dark-default',
        mode: 'dark',
        useSystemFonts: false,
        customThemes: [],
      };

      // Simulate async storage
      return new Promise((resolve) => {
        setTimeout(() => resolve(defaultSettings), 100);
      });
    } catch (error) {
      console.error('Failed to get theme settings:', error);
      throw error;
    }
  }

  /**
   * Save theme settings to storage
   */
  async saveSettings(settings: ThemeSettings): Promise<void> {
    try {
      // In a real app, this would use AsyncStorage or SecureStorage
      console.log('Saving theme settings:', settings);
      
      // Simulate async storage
      return new Promise((resolve) => {
        setTimeout(() => resolve(), 100);
      });
    } catch (error) {
      console.error('Failed to save theme settings:', error);
      throw error;
    }
  }

  /**
   * Get all available themes (built-in + custom)
   */
  async getAllThemes(): Promise<Theme[]> {
    try {
      const builtInThemes = this.getBuiltInThemes();
      const customThemes = await this.getCustomThemes();
      
      return [...builtInThemes, ...customThemes];
    } catch (error) {
      console.error('Failed to get all themes:', error);
      throw error;
    }
  }

  /**
   * Get built-in themes
   */
  private getBuiltInThemes(): Theme[] {
    return [
      {
        id: 'light-default',
        name: 'Light Default',
        description: 'Clean and modern light theme',
        isDark: false,
        isCustom: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        colors: {
          primary: '#2563eb',
          primaryLight: '#3b82f6',
          primaryDark: '#1d4ed8',
          secondary: '#64748b',
          secondaryLight: '#94a3b8',
          secondaryDark: '#475569',
          background: '#ffffff',
          backgroundSecondary: '#f8fafc',
          backgroundTertiary: '#f1f5f9',
          surface: '#ffffff',
          surfaceSecondary: '#f8fafc',
          surfaceBorder: '#e2e8f0',
          text: '#0f172a',
          textSecondary: '#475569',
          textTertiary: '#64748b',
          textInverse: '#ffffff',
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444',
          info: '#06b6d4',
          accent: '#8b5cf6',
          accentLight: '#a78bfa',
          accentDark: '#7c3aed',
          shadow: '#000000',
          overlay: 'rgba(0, 0, 0, 0.5)',
          highlight: '#fef3c7',
        },
        fonts: {
          primary: 'System',
          secondary: 'System',
          mono: 'Monospace',
          xs: 12,
          sm: 14,
          base: 16,
          lg: 18,
          xl: 20,
          xxl: 24,
          xxxl: 32,
          light: '300',
          normal: '400',
          medium: '500',
          semibold: '600',
          bold: '700',
          extrabold: '800',
        },
        spacing: {
          xs: 4,
          sm: 8,
          md: 16,
          lg: 24,
          xl: 32,
          xxl: 48,
        },
        borderRadius: {
          none: 0,
          sm: 4,
          md: 8,
          lg: 12,
          xl: 16,
          full: 9999,
        },
        shadows: {
          sm: {
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 1,
          },
          md: {
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 6,
            elevation: 4,
          },
          lg: {
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.15,
            shadowRadius: 12,
            elevation: 8,
          },
        },
      },
      {
        id: 'dark-default',
        name: 'Dark Default',
        description: 'Elegant dark theme with high contrast',
        isDark: true,
        isCustom: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        colors: {
          primary: '#3b82f6',
          primaryLight: '#60a5fa',
          primaryDark: '#2563eb',
          secondary: '#64748b',
          secondaryLight: '#94a3b8',
          secondaryDark: '#475569',
          background: '#0f172a',
          backgroundSecondary: '#1e293b',
          backgroundTertiary: '#334155',
          surface: '#1e293b',
          surfaceSecondary: '#334155',
          surfaceBorder: '#475569',
          text: '#f8fafc',
          textSecondary: '#cbd5e1',
          textTertiary: '#94a3b8',
          textInverse: '#0f172a',
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444',
          info: '#06b6d4',
          accent: '#8b5cf6',
          accentLight: '#a78bfa',
          accentDark: '#7c3aed',
          shadow: '#000000',
          overlay: 'rgba(0, 0, 0, 0.7)',
          highlight: '#4c1d95',
        },
        fonts: {
          primary: 'System',
          secondary: 'System',
          mono: 'Monospace',
          xs: 12,
          sm: 14,
          base: 16,
          lg: 18,
          xl: 20,
          xxl: 24,
          xxxl: 32,
          light: '300',
          normal: '400',
          medium: '500',
          semibold: '600',
          bold: '700',
          extrabold: '800',
        },
        spacing: {
          xs: 4,
          sm: 8,
          md: 16,
          lg: 24,
          xl: 32,
          xxl: 48,
        },
        borderRadius: {
          none: 0,
          sm: 4,
          md: 8,
          lg: 12,
          xl: 16,
          full: 9999,
        },
        shadows: {
          sm: {
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 1,
          },
          md: {
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 6,
            elevation: 4,
          },
          lg: {
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3,
            shadowRadius: 12,
            elevation: 8,
          },
        },
      },
      {
        id: 'torres-family',
        name: 'Torres Family',
        description: 'Warm, family-friendly theme with purple accents',
        isDark: true,
        isCustom: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        colors: {
          primary: '#9c03f5',
          primaryLight: '#b826ff',
          primaryDark: '#7c00cc',
          secondary: '#03c54d',
          secondaryLight: '#26e474',
          secondaryDark: '#009837',
          background: '#1a0033',
          backgroundSecondary: '#2d1a4d',
          backgroundTertiary: '#403366',
          surface: '#2d1a4d',
          surfaceSecondary: '#403366',
          surfaceBorder: '#594d80',
          text: '#ffffff',
          textSecondary: '#e6d5ff',
          textTertiary: '#cc99ff',
          textInverse: '#1a0033',
          success: '#03c54d',
          warning: '#ff9500',
          error: '#ff3b30',
          info: '#00bfff',
          accent: '#ff6b9d',
          accentLight: '#ff8fab',
          accentDark: '#e63946',
          shadow: '#000000',
          overlay: 'rgba(26, 0, 51, 0.8)',
          highlight: '#ffeb3b',
        },
        fonts: {
          primary: 'System',
          secondary: 'System',
          mono: 'Monospace',
          xs: 12,
          sm: 14,
          base: 16,
          lg: 18,
          xl: 20,
          xxl: 24,
          xxxl: 32,
          light: '300',
          normal: '400',
          medium: '500',
          semibold: '600',
          bold: '700',
          extrabold: '800',
        },
        spacing: {
          xs: 4,
          sm: 8,
          md: 16,
          lg: 24,
          xl: 32,
          xxl: 48,
        },
        borderRadius: {
          none: 0,
          sm: 6,
          md: 12,
          lg: 18,
          xl: 24,
          full: 9999,
        },
        shadows: {
          sm: {
            shadowColor: '#9c03f5',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.2,
            shadowRadius: 2,
            elevation: 1,
          },
          md: {
            shadowColor: '#9c03f5',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 6,
            elevation: 4,
          },
          lg: {
            shadowColor: '#9c03f5',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.4,
            shadowRadius: 12,
            elevation: 8,
          },
        },
      },
    ];
  }

  /**
   * Get custom themes from storage
   */
  async getCustomThemes(): Promise<Theme[]> {
    try {
      // In a real app, this would load from AsyncStorage
      // For now, return empty array
      return [];
    } catch (error) {
      console.error('Failed to get custom themes:', error);
      return [];
    }
  }

  /**
   * Create a new custom theme
   */
  async createCustomTheme(themeData: Omit<Theme, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const id = `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const theme: Theme = {
        ...themeData,
        id,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      // In a real app, this would save to AsyncStorage
      console.log('Creating custom theme:', theme);
      
      return id;
    } catch (error) {
      console.error('Failed to create custom theme:', error);
      throw error;
    }
  }

  /**
   * Update an existing custom theme
   */
  async updateCustomTheme(themeId: string, updates: Partial<Theme>): Promise<void> {
    try {
      // In a real app, this would update in AsyncStorage
      console.log(`Updating custom theme ${themeId}:`, updates);
    } catch (error) {
      console.error('Failed to update custom theme:', error);
      throw error;
    }
  }

  /**
   * Delete a custom theme
   */
  async deleteCustomTheme(themeId: string): Promise<void> {
    try {
      // In a real app, this would delete from AsyncStorage
      console.log(`Deleting custom theme: ${themeId}`);
    } catch (error) {
      console.error('Failed to delete custom theme:', error);
      throw error;
    }
  }

  /**
   * Export a theme to JSON
   */
  async exportTheme(themeId: string): Promise<string> {
    try {
      const themes = await this.getAllThemes();
      const theme = themes.find(t => t.id === themeId);
      
      if (!theme) {
        throw new Error(`Theme ${themeId} not found`);
      }

      const exportData = {
        name: theme.name,
        description: theme.description,
        colors: theme.colors,
        fonts: theme.fonts,
        spacing: theme.spacing,
        borderRadius: theme.borderRadius,
        shadows: theme.shadows,
        isDark: theme.isDark,
        version: '1.0.0',
        exportedAt: Date.now(),
      };

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('Failed to export theme:', error);
      throw error;
    }
  }

  /**
   * Import a theme from JSON
   */
  async importTheme(themeJson: string): Promise<string> {
    try {
      const importData = JSON.parse(themeJson);
      
      // Validate import data structure
      if (!importData.name || !importData.colors) {
        throw new Error('Invalid theme format');
      }

      const themeId = await this.createCustomTheme({
        name: importData.name,
        description: importData.description,
        colors: importData.colors,
        fonts: importData.fonts,
        spacing: importData.spacing,
        borderRadius: importData.borderRadius,
        shadows: importData.shadows,
        isDark: importData.isDark || false,
        isCustom: true,
      });

      return themeId;
    } catch (error) {
      console.error('Failed to import theme:', error);
      throw error;
    }
  }

  /**
   * Reset all theme settings to defaults
   */
  async resetToDefault(): Promise<void> {
    try {
      const defaultSettings: ThemeSettings = {
        currentThemeId: 'dark-default',
        mode: 'dark',
        useSystemFonts: false,
        customThemes: [],
      };

      await this.saveSettings(defaultSettings);
    } catch (error) {
      console.error('Failed to reset to default theme:', error);
      throw error;
    }
  }

  /**
   * Get theme presets for quick selection
   */
  getThemePresets(): ThemePreset[] {
    return [
      {
        id: 'ocean-blue',
        name: 'Ocean Blue',
        description: 'Calming blue tones inspired by the sea',
        theme: {
          isDark: false,
          colors: {
            primary: '#0891b2',
            primaryLight: '#06b6d4',
            primaryDark: '#0e7490',
            secondary: '#64748b',
            secondaryLight: '#94a3b8',
            secondaryDark: '#475569',
            background: '#f0f9ff',
            backgroundSecondary: '#e0f2fe',
            backgroundTertiary: '#bae6fd',
            surface: '#ffffff',
            surfaceSecondary: '#f8fafc',
            surfaceBorder: '#e2e8f0',
            text: '#0c4a6e',
            textSecondary: '#075985',
            textTertiary: '#0e7490',
            textInverse: '#ffffff',
            success: '#10b981',
            warning: '#f59e0b',
            error: '#ef4444',
            info: '#06b6d4',
            accent: '#0284c7',
            accentLight: '#0ea5e9',
            accentDark: '#0369a1',
            shadow: '#000000',
            overlay: 'rgba(0, 0, 0, 0.5)',
            highlight: '#dbeafe',
          },
          fonts: {
            primary: 'System',
            secondary: 'System',
            mono: 'Monospace',
            xs: 12,
            sm: 14,
            base: 16,
            lg: 18,
            xl: 20,
            xxl: 24,
            xxxl: 32,
            light: '300',
            normal: '400',
            medium: '500',
            semibold: '600',
            bold: '700',
            extrabold: '800',
          },
          spacing: {
            xs: 4,
            sm: 8,
            md: 16,
            lg: 24,
            xl: 32,
            xxl: 48,
          },
          borderRadius: {
            none: 0,
            sm: 4,
            md: 8,
            lg: 12,
            xl: 16,
            full: 9999,
          },
          shadows: {
            sm: {
              shadowColor: '#000000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 2,
              elevation: 1,
            },
            md: {
              shadowColor: '#000000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 6,
              elevation: 4,
            },
            lg: {
              shadowColor: '#000000',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.15,
              shadowRadius: 12,
              elevation: 8,
            },
          },
        },
      },
      {
        id: 'sunset-orange',
        name: 'Sunset Orange',
        description: 'Warm orange tones reminiscent of a beautiful sunset',
        theme: {
          isDark: false,
          colors: {
            primary: '#ea580c',
            primaryLight: '#f97316',
            primaryDark: '#c2410c',
            secondary: '#64748b',
            secondaryLight: '#94a3b8',
            secondaryDark: '#475569',
            background: '#fff7ed',
            backgroundSecondary: '#fed7aa',
            backgroundTertiary: '#fdba74',
            surface: '#ffffff',
            surfaceSecondary: '#fef3c7',
            surfaceBorder: '#fed7aa',
            text: '#7c2d12',
            textSecondary: '#9a3412',
            textTertiary: '#c2410c',
            textInverse: '#ffffff',
            success: '#10b981',
            warning: '#f59e0b',
            error: '#ef4444',
            info: '#06b6d4',
            accent: '#dc2626',
            accentLight: '#ef4444',
            accentDark: '#b91c1c',
            shadow: '#000000',
            overlay: 'rgba(0, 0, 0, 0.5)',
            highlight: '#fef3c7',
          },
          fonts: {
            primary: 'System',
            secondary: 'System',
            mono: 'Monospace',
            xs: 12,
            sm: 14,
            base: 16,
            lg: 18,
            xl: 20,
            xxl: 24,
            xxxl: 32,
            light: '300',
            normal: '400',
            medium: '500',
            semibold: '600',
            bold: '700',
            extrabold: '800',
          },
          spacing: {
            xs: 4,
            sm: 8,
            md: 16,
            lg: 24,
            xl: 32,
            xxl: 48,
          },
          borderRadius: {
            none: 0,
            sm: 4,
            md: 8,
            lg: 12,
            xl: 16,
            full: 9999,
          },
          shadows: {
            sm: {
              shadowColor: '#000000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 2,
              elevation: 1,
            },
            md: {
              shadowColor: '#000000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 6,
              elevation: 4,
            },
            lg: {
              shadowColor: '#000000',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.15,
              shadowRadius: 12,
              elevation: 8,
            },
          },
        },
      },
    ];
  }
}
