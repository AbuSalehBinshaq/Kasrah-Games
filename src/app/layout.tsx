import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import SEO from '@/components/common/SEO';
import { getSettings } from '@/lib/settings';
import dynamic from 'next/dynamic';

// Import all Client Components with dynamic import and ssr: false to prevent prerendering issues
const MobileNav = dynamic(() => import('@/components/common/MobileNav'), {
  ssr: false,
});

const Header = dynamic(() => import('@/components/common/Header'), {
  ssr: false,
});

const Footer = dynamic(() => import('@/components/common/Footer'), {
  ssr: false,
});

const MaintenanceWrapper = dynamic(() => import('@/components/common/MaintenanceWrapper'), {
  ssr: false,
});

const ThemeProvider = dynamic(() => import('@/components/common/ThemeProvider'), {
  ssr: false,
});

const AdDisplay = dynamic(() => import('@/components/common/AdDisplay'), {
  ssr: false,
});

const inter = Inter({ subsets: ['latin'] });

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const siteUrl = settings.siteUrl || process.env.NEXT_PUBLIC_SITE_URL || 'https://kasrahgames.example';
  const siteName = settings.siteName || 'Kasrah Games';
  const description = settings.seoMetaDescription || settings.siteDescription || 'A web games platform hosting playable HTML5 and WebGL games with categories, ratings, and user playlists.';
  const keywords = settings.seoMetaKeywords?.split(',').map(k => k.trim()) || ['online games', 'HTML5 games', 'WebGL games', 'free games', 'browser games'];

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: settings.seoMetaTitle || `${siteName} - Play Free Online Games`,
      template: `%s | ${siteName}`,
    },
    description,
    keywords,
    authors: [{ name: siteName }],
    creator: siteName,
    publisher: siteName,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: siteUrl,
      title: settings.seoMetaTitle || `${siteName} - Play Free Online Games`,
      description,
      siteName,
    },
    twitter: {
      card: 'summary_large_image',
      title: settings.seoMetaTitle || `${siteName} - Play Free Online Games`,
      description,
    },
    icons: {
      icon: settings.siteFavicon || '/favicon.ico',
      shortcut: '/favicon-16x16.png',
      apple: '/apple-touch-icon.png',
    },
    manifest: '/site.webmanifest',
  };
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettings();
  const siteUrl = settings.siteUrl || process.env.NEXT_PUBLIC_SITE_URL || 'https://kasrahgames.example';

  return (
    <html lang="en" dir="ltr">
      <head>
        <SEO 
          title={settings.seoMetaTitle || `${settings.siteName} - Play Free Online Games`}
          description={settings.seoMetaDescription || settings.siteDescription}
          siteName={settings.siteName}
          siteUrl={siteUrl}
        />
        {settings.enableAnalytics && settings.analyticsCode && (
          <script dangerouslySetInnerHTML={{ __html: settings.analyticsCode }} />
        )}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: settings.siteName,
              url: siteUrl,
              description: settings.siteDescription,
              potentialAction: {
                '@type': 'SearchAction',
                target: `${siteUrl}/games?search={search_term_string}`,
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
      </head>
      <body className={`${inter.className} min-h-screen`}>
        <ThemeProvider>
          <MaintenanceWrapper>
            <div className="pb-24">{children}</div>
          </MaintenanceWrapper>

          <MobileNav />
          
          {/* Popup Ads */}
          <AdDisplay position="POPUP" />
        </ThemeProvider>
      </body>
    </html>
  );
}
