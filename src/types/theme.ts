/**
 * Theme types and interfaces for the TorresTrivia app
 */

export interface ThemeColors {
  // Primary colors
  primary: string;
  primaryLight: string;
  primaryDark: string;
  
  // Secondary colors
  secondary: string;
  secondaryLight: string;
  secondaryDark: string;
  
  // Background colors
  background: string;
  backgroundSecondary: string;
  backgroundTertiary: string;
  
  // Surface colors
  surface: string;
  surfaceSecondary: string;
  surfaceBorder: string;
  
  // Text colors
  text: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;
  
  // Status colors
  success: string;
  warning: string;
  error: string;
  info: string;
  
  // Accent colors
  accent: string;
  accentLight: string;
  accentDark: string;
  
  // Special colors
  shadow: string;
  overlay: string;
  highlight: string;
}

export interface ThemeFonts {
  // Font families
  primary: string;
  secondary: string;
  mono: string;
  
  // Font sizes
  xs: number;
  sm: number;
  base: number;
  lg: number;
  xl: number;
  xxl: number;
  xxxl: number;
  
  // Font weights
  light: string;
  normal: string;
  medium: string;
  semibold: string;
  bold: string;
  extrabold: string;
}

export interface ThemeSpacing {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
}

export interface ThemeBorderRadius {
  none: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  full: number;
}

export interface ThemeShadows {
  sm: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
  md: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
  lg: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
}

export interface Theme {
  id: string;
  name: string;
  description?: string;
  colors: ThemeColors;
  fonts: ThemeFonts;
  spacing: ThemeSpacing;
  borderRadius: ThemeBorderRadius;
  shadows: ThemeShadows;
  isDark: boolean;
  isCustom: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface ThemePreset {
  id: string;
  name: string;
  description?: string;
  theme: Omit<Theme, 'id' | 'name' | 'description' | 'isCustom' | 'createdAt' | 'updatedAt'>;
}

export interface ThemeCustomization {
  colors: Partial<ThemeColors>;
  fonts: Partial<ThemeFonts>;
  spacing: Partial<ThemeSpacing>;
  borderRadius: Partial<ThemeBorderRadius>;
}

export type ThemeMode = 'light' | 'dark' | 'auto';

export interface ThemeSettings {
  currentThemeId: string;
  mode: ThemeMode;
  useSystemFonts: boolean;
  customThemes: Theme[];
}
