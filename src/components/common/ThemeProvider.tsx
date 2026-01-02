'use client';

import { useEffect, useState } from 'react';
import { useSettings } from '@/hooks/useSettings';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { settings } = useSettings();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || typeof document === 'undefined') return;
    
    // Update CSS variables when settings change
    const root = document.documentElement;
    
    const primaryColor = settings.primaryColor || '#7c3aed';
    const primaryHover = settings.primaryColorHover || '#6d28d9';
    const bgFrom = settings.backgroundFrom || '#f8fafc';
    const bgTo = settings.backgroundTo || '#eef2ff';
    
    root.style.setProperty('--color-primary', primaryColor);
    root.style.setProperty('--color-primary-hover', primaryHover);
    root.style.setProperty('--color-bg-from', bgFrom);
    root.style.setProperty('--color-bg-to', bgTo);

    // Update body background gradient
    if (document.body) {
      document.body.style.background = `linear-gradient(to bottom, ${bgFrom}, ${bgTo})`;
    }
  }, [mounted, settings.primaryColor, settings.primaryColorHover, settings.backgroundFrom, settings.backgroundTo]);

  return <>{children}</>;
}

