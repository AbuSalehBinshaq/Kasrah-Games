import { prisma } from './prisma';

export interface SiteSettings {
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
  enableAnalytics?: boolean;
  analyticsCode?: string | null;
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

export async function getSettings(): Promise<SiteSettings> {
  // Check if DATABASE_URL is available before attempting database connection
  if (!process.env.DATABASE_URL) {
    return defaultSettings;
  }

  try {
    const settings = await prisma.settings.findUnique({
      where: { id: 'site-settings' },
    });

    if (!settings) {
      return defaultSettings;
    }

    return {
      siteName: settings.siteName,
      siteDescription: settings.siteDescription,
      siteLogo: settings.siteLogo,
      siteFavicon: settings.siteFavicon,
      siteUrl: settings.siteUrl,
      contactEmail: settings.contactEmail,
      socialFacebook: settings.socialFacebook,
      socialTwitter: settings.socialTwitter,
      socialInstagram: settings.socialInstagram,
      socialYoutube: settings.socialYoutube,
      maintenanceMode: settings.maintenanceMode,
      maintenanceMessage: settings.maintenanceMessage,
      gamesPerPage: settings.gamesPerPage,
      enableRatings: settings.enableRatings,
      enableComments: settings.enableComments,
      enableBookmarks: settings.enableBookmarks,
      showStatistics: settings.showStatistics,
      primaryColor: settings.primaryColor,
      primaryColorHover: settings.primaryColorHover,
      backgroundFrom: settings.backgroundFrom,
      backgroundTo: settings.backgroundTo,
      enableAnalytics: settings.enableAnalytics,
      analyticsCode: settings.analyticsCode,
      seoMetaTitle: settings.seoMetaTitle,
      seoMetaDescription: settings.seoMetaDescription,
      seoMetaKeywords: settings.seoMetaKeywords,
    };
  } catch (error) {
    // Silently return default settings if database is not available
    // This allows the app to build and run even without database connection
    if (process.env.NODE_ENV === 'development') {
      console.warn('Failed to fetch settings from database, using defaults:', error instanceof Error ? error.message : 'Unknown error');
    }
    return defaultSettings;
  }
}

