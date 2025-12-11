'use client';

import { useState, useEffect } from 'react';

interface SiteSettings {
  siteName: string;
  siteDescription: string;
  siteLogo?: string | null;
  siteFavicon?: string | null;
  siteUrl?: string | null;
  contactEmail?: string | null;
  socialFacebook?: string | null;
  socialTwitter?: string | null;
  socialInstagram?: string | null;
  socialYoutube?: string | null;
  maintenanceMode: boolean;
  maintenanceMessage?: string | null;
  gamesPerPage: number;
  enableRatings: boolean;
  enableComments: boolean;
  enableBookmarks: boolean;
  showStatistics: boolean;
  primaryColor?: string | null;
  primaryColorHover?: string | null;
  backgroundFrom?: string | null;
  backgroundTo?: string | null;
  seoMetaTitle?: string | null;
  seoMetaDescription?: string | null;
  seoMetaKeywords?: string | null;
}

const defaultSettings: SiteSettings = {
  siteName: 'Kasrah Games',
  siteDescription: 'Play the best HTML5 and WebGL games online',
  siteLogo: null,
  siteFavicon: null,
  siteUrl: null,
  contactEmail: null,
  socialFacebook: null,
  socialTwitter: null,
  socialInstagram: null,
  socialYoutube: null,
  maintenanceMode: false,
  maintenanceMessage: null,
  gamesPerPage: 12,
  enableRatings: true,
  enableComments: true,
  enableBookmarks: true,
  showStatistics: true,
  primaryColor: '#7c3aed',
  primaryColorHover: '#6d28d9',
  backgroundFrom: '#f8fafc',
  backgroundTo: '#eef2ff',
  seoMetaTitle: null,
  seoMetaDescription: null,
  seoMetaKeywords: null,
};

export function useSettings() {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const response = await fetch('/api/settings');
        if (response.ok) {
          const data = await response.json();
          console.log('📊 Settings loaded:', { showStatistics: data.showStatistics });
          setSettings(data);
        }
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchSettings();
  }, []);

  return { settings, loading };
}

