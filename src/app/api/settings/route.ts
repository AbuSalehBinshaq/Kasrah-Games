import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Get settings (public endpoint, no auth required)
    let settings = await prisma.settings.findUnique({
      where: { id: 'site-settings' },
    });

    if (!settings) {
      // Return default settings if they don't exist
      return NextResponse.json({
        id: 'site-settings',
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
        allowRegistration: true,
        requireEmailVerification: false,
        gamesPerPage: 12,
        enableRatings: true,
        enableComments: true,
        enableBookmarks: true,
        showStatistics: true,
        primaryColor: '#7c3aed',
        primaryColorHover: '#6d28d9',
        backgroundFrom: '#f8fafc',
        backgroundTo: '#eef2ff',
        enableAnalytics: false,
        analyticsCode: null,
        seoMetaTitle: null,
        seoMetaDescription: null,
        seoMetaKeywords: null,
      });
    }

    // Don't expose sensitive information in public endpoint
    const publicSettings = {
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
      showStatistics: settings.showStatistics ?? true, // Default to true if null
      primaryColor: settings.primaryColor ?? '#7c3aed',
      primaryColorHover: settings.primaryColorHover ?? '#6d28d9',
      backgroundFrom: settings.backgroundFrom ?? '#f8fafc',
      backgroundTo: settings.backgroundTo ?? '#eef2ff',
      seoMetaTitle: settings.seoMetaTitle,
      seoMetaDescription: settings.seoMetaDescription,
      seoMetaKeywords: settings.seoMetaKeywords,
    };

    return NextResponse.json(publicSettings);
  } catch (error) {
    console.error('Public settings fetch error:', error);
    // Return default settings on error
    return NextResponse.json({
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
    });
  }
}

