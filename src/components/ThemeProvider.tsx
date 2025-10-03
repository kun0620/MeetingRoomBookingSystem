import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useSystemSettings } from '../hooks/useSystemSettings';

interface ThemeContextType {
  themeSettings: any;
  brandingSettings: any;
  applyTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { getThemeSettings, getBrandingSettings, loading } = useSystemSettings();
  
  const themeSettings = getThemeSettings();
  const brandingSettings = getBrandingSettings();

  const applyTheme = () => {
    if (loading) return;

    const root = document.documentElement;
    
    // Apply CSS custom properties
    root.style.setProperty('--color-primary', themeSettings.primary_color);
    root.style.setProperty('--color-secondary', themeSettings.secondary_color);
    root.style.setProperty('--color-accent', themeSettings.accent_color);
    root.style.setProperty('--color-success', themeSettings.success_color);
    root.style.setProperty('--color-warning', themeSettings.warning_color);
    root.style.setProperty('--color-error', themeSettings.error_color);

    // Update document title
    if (brandingSettings.organization_name) {
      document.title = brandingSettings.organization_name;
    }

    // Update favicon
    if (brandingSettings.favicon_url) {
      const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement || document.createElement('link');
      link.type = 'image/x-icon';
      link.rel = 'shortcut icon';
      link.href = brandingSettings.favicon_url;
      document.getElementsByTagName('head')[0].appendChild(link);
    }
  };

  useEffect(() => {
    applyTheme();
  }, [themeSettings, brandingSettings, loading]);

  return (
    <ThemeContext.Provider value={{ themeSettings, brandingSettings, applyTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}