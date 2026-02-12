'use client';

import { useEffect } from 'react';
import { useSettings } from '@/hooks/useSettings';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { settings, loading } = useSettings();

  useEffect(() => {
    if (loading || typeof document === 'undefined') return;
    
    // Update CSS variables when settings change (e.g., after user updates them in settings page)
    const root = document.documentElement;
    
    const primaryColor = settings.primaryColor || '#7c3aed';
    const primaryHover = settings.primaryColorHover || '#6d28d9';
    const bgFrom = settings.backgroundFrom || '#f8fafc';
    const bgTo = settings.backgroundTo || '#eef2ff';
    
    // Only update if different from current to avoid unnecessary reflows
    if (root.style.getPropertyValue('--color-primary') !== primaryColor) {
      root.style.setProperty('--color-primary', primaryColor);
      root.style.setProperty('--color-primary-hover', primaryHover);
      root.style.setProperty('--color-bg-from', bgFrom);
      root.style.setProperty('--color-bg-to', bgTo);
      
      if (document.body) {
        document.body.style.background = `linear-gradient(to bottom, ${bgFrom}, ${bgTo})`;
      }
    }
  }, [loading, settings.primaryColor, settings.primaryColorHover, settings.backgroundFrom, settings.backgroundTo]);

  return <>{children}</>;
}
