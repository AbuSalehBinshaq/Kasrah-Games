import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { getSettings } from '@/lib/settings';
import nextDynamic from 'next/dynamic';

export const dynamic = 'force-dynamic';

// Import all Client Components with dynamic import and ssr: false to prevent prerendering issues
const MobileNav = nextDynamic(() => import('@/components/common/MobileNav'), {
  ssr: false,
});

const ThemeProvider = nextDynamic(() => import('@/components/common/ThemeProvider'), {
  ssr: false,
});

const MaintenanceWrapper = nextDynamic(() => import('@/components/common/MaintenanceWrapper'), {
  ssr: false,
});

const AdDisplay = nextDynamic(() => import('@/components/common/AdDisplay'), {
  ssr: false,
});

const inter = Inter({ subsets: ['latin'] });

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const siteUrl = settings.siteUrl || process.env.NEXT_PUBLIC_SITE_URL || 'https://kasrah-games.onrender.com';
  const siteName = settings.siteName || 'Kasrah Games';
  const description = settings.seoMetaDescription || settings.siteDescription || 'كسرة جيمز هي منصتك المثالية لأفضل ألعاب المتصفح المجانية. استمتع بتجربة لعب فورية لمئات الألعاب من فئات الأكشن، الألغاز، والمغامرات بجودة عالية وبدون تحميل.';
  const keywords = settings.seoMetaKeywords?.split(',').map(k => k.trim()) || ['online games', 'HTML5 games', 'free games'];

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: settings.seoMetaTitle || `${siteName} - Play Free Online Games`,
      template: `%s | ${siteName}`,
    },
    description,
    keywords,
    icons: {
      icon: settings.siteFavicon || '/favicon.ico',
    },
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
  const siteUrl = settings.siteUrl || process.env.NEXT_PUBLIC_SITE_URL || 'https://kasrah-games.onrender.com';

  const primaryColor = settings.primaryColor || '#7c3aed';
  const primaryHover = settings.primaryColorHover || '#6d28d9';
  const bgFrom = settings.backgroundFrom || '#f8fafc';
  const bgTo = settings.backgroundTo || '#eef2ff';

  return (
    <html lang="en" dir="ltr">
      <head>
        <style id="theme-vars" dangerouslySetInnerHTML={{ __html: `
          :root {
            --color-primary: ${primaryColor};
            --color-primary-hover: ${primaryHover};
            --color-bg-from: ${bgFrom};
            --color-bg-to: ${bgTo};
          }
          body {
            background: linear-gradient(to bottom, ${bgFrom}, ${bgTo}) !important;
          }
        `}} />
        {settings.enableAnalytics && settings.analyticsCode && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${settings.analyticsCode}`} />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${settings.analyticsCode}');
                `,
              }}
            />
          </>
        )}
      </head>
      <body className={`${inter.className} min-h-screen`}>
        <ThemeProvider>
          <MaintenanceWrapper>
            <div className="pb-24">{children}</div>
          </MaintenanceWrapper>
          <MobileNav />
          <AdDisplay position="POPUP" />
        </ThemeProvider>
      </body>
    </html>
  );
}
